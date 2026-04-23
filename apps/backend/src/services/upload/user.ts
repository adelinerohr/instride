import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { ObjectNotFound } from "encore.dev/storage/objects";

import { assertExists } from "@/shared/utils/validation";

import { requireAdminOrSelf } from "../auth/gates";
import { authUsers } from "../auth/schema";
import { avatarsBucket } from "./bucket";
import { db } from "./db";
import {
  ALLOWED_IMAGE_TYPES,
  getUserAvatarKey,
  isAllowedContentType,
} from "./utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface UploadAvatarParams {
  userId: string;
  contentType: string;
  // base64-encoded file contents
  data: string;
}

interface UploadAvatarResponse {
  avatarUrl: string;
}

export const uploadAvatar = api(
  {
    method: "POST",
    path: "/upload/avatar",
    auth: true,
    expose: true,
    bodyLimit: 5 * 1024 * 1024 * 2, // base64 inflates ~33%
  },
  async (params: UploadAvatarParams): Promise<UploadAvatarResponse> => {
    await requireAdminOrSelf(params.userId);

    if (!isAllowedContentType(params.contentType, ALLOWED_IMAGE_TYPES)) {
      throw APIError.invalidArgument("Invalid file type");
    }

    const buffer = Buffer.from(params.data, "base64");
    if (buffer.length === 0) {
      throw APIError.invalidArgument("File is empty");
    }
    if (buffer.length > MAX_SIZE_BYTES) {
      throw APIError.invalidArgument("File too large (max 5MB)");
    }

    const key = getUserAvatarKey(params.userId);
    await avatarsBucket.upload(key, buffer, {
      contentType: params.contentType,
    });

    const avatarUrl = avatarsBucket.publicUrl(key);

    const previous = await db.query.authUsers.findFirst({
      where: { id: params.userId },
    });
    assertExists(previous, "User not found");

    await db
      .update(authUsers)
      .set({ image: avatarUrl, imageKey: key })
      .where(eq(authUsers.id, params.userId));

    if (previous.imageKey && previous.imageKey !== key) {
      await avatarsBucket.remove(previous.imageKey);
    }

    return { avatarUrl };
  }
);

interface DeleteAvatarParams {
  userId: string;
}

export const deleteAvatar = api(
  {
    method: "DELETE",
    path: "/upload/avatar",
    auth: true,
    expose: true,
  },
  async (params: DeleteAvatarParams): Promise<void> => {
    await requireAdminOrSelf(params.userId);

    const previous = await db.query.authUsers.findFirst({
      where: { id: params.userId },
    });
    assertExists(previous, "User not found");

    await db
      .update(authUsers)
      .set({ image: null, imageKey: null })
      .where(eq(authUsers.id, params.userId));

    if (previous.imageKey) {
      try {
        await avatarsBucket.remove(previous.imageKey);
      } catch (err) {
        if (!(err instanceof ObjectNotFound)) throw err;
      }
    }
  }
);
