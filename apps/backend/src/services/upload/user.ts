import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { requireAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { requireAdminOrSelf } from "../auth/gates";
import { authUsers } from "../auth/schema";
import { avatarsBucket } from "./bucket";
import { db } from "./db";
import {
  ALLOWED_IMAGE_TYPES,
  getUserAvatarKey,
  isAllowedContentType,
  getUserAvatarPrefix,
} from "./utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const UPLOAD_TTL_SECONDS = 300; // 5 minutes

interface UploadAvatarParams {
  userId?: string;
  contentType: string;
  size: number;
}

interface UploadAvatarResponse {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

export const uploadAvatar = api(
  {
    method: "POST",
    path: "/upload/avatar",
    auth: true,
    expose: true,
  },
  async (params: UploadAvatarParams): Promise<UploadAvatarResponse> => {
    const { userID } = requireAuth();
    const userId = params.userId ?? userID;

    if (userId) {
      await requireAdminOrSelf(userId);
    }

    if (!isAllowedContentType(params.contentType, ALLOWED_IMAGE_TYPES)) {
      throw APIError.invalidArgument("Invalid file type");
    }

    if (params.size <= 0) {
      throw APIError.invalidArgument("File size must be greater than 0");
    }

    if (params.size > MAX_SIZE_BYTES) {
      throw APIError.invalidArgument("File too large (max 5MB)");
    }

    const key = getUserAvatarKey(userId);
    const { url } = await avatarsBucket.signedUploadUrl(key, {
      ttl: UPLOAD_TTL_SECONDS,
    });

    return {
      uploadUrl: url,
      key,
      expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString(),
    };
  }
);

interface ConfirmAvatarUploadParams {
  userId?: string;
  key: string;
}

interface ConfirmAvatarUploadResponse {
  avatarUrl: string;
}

export const confirmAvatarUpload = api(
  {
    method: "POST",
    path: "/upload/avatar/confirm",
    auth: true,
    expose: true,
  },
  async (
    params: ConfirmAvatarUploadParams
  ): Promise<ConfirmAvatarUploadResponse> => {
    const { userID } = requireAuth();
    const userId = params.userId ?? userID;

    if (userId) {
      await requireAdminOrSelf(userId);
    }

    const expectedPrefix = getUserAvatarPrefix(userId);
    if (!params.key.startsWith(expectedPrefix)) {
      throw APIError.permissionDenied("Key does not match user");
    }

    const exists = await avatarsBucket.exists(params.key);
    assertExists(exists, "Avatar file not found");

    const attrs = await avatarsBucket.attrs(params.key);

    if (attrs.size <= 0) {
      await avatarsBucket.remove(params.key);
      throw APIError.invalidArgument("Uploaded file is empty");
    }

    if (attrs.size > MAX_SIZE_BYTES) {
      await avatarsBucket.remove(params.key);
      throw APIError.invalidArgument("File too large (max 5MB)");
    }

    if (
      !attrs.contentType ||
      !isAllowedContentType(attrs.contentType, ALLOWED_IMAGE_TYPES)
    ) {
      await avatarsBucket.remove(params.key);
      throw APIError.invalidArgument("Invalid file type");
    }

    const avatarUrl = avatarsBucket.publicUrl(params.key);

    const previous = await db.query.authUsers.findFirst({
      where: {
        id: userId,
      },
    });

    assertExists(previous, "User not found");

    await db
      .update(authUsers)
      .set({ image: avatarUrl, imageKey: params.key })
      .where(eq(authUsers.id, userId));

    if (previous.imageKey && previous.imageKey !== params.key) {
      await avatarsBucket.remove(previous.imageKey);
    }

    return { avatarUrl };
  }
);

interface DeleteUserAvatarParams {
  userId?: string;
}

export const deleteUserAvatar = api(
  {
    method: "DELETE",
    path: "/upload/avatar/user",
    auth: true,
    expose: true,
  },
  async (params: DeleteUserAvatarParams): Promise<void> => {
    const { userID } = requireAuth();
    const userId = params.userId ?? userID;

    if (userId) {
      await requireAdminOrSelf(userId);
    }

    const previous = await db.query.authUsers.findFirst({
      where: {
        id: userId,
      },
    });

    assertExists(previous, "User not found");

    await db
      .update(authUsers)
      .set({ image: null, imageKey: null })
      .where(eq(authUsers.id, userId));

    if (previous.imageKey) {
      await avatarsBucket.remove(previous.imageKey);
    }
  }
);
