import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { ObjectNotFound } from "encore.dev/storage/objects";

import { assertExists } from "@/shared/utils/validation";

import { requireOrganizationAdmin } from "../auth/gates";
import { organizations as organizationsTable } from "../organizations/schema";
import { avatarsBucket } from "./bucket";
import { db } from "./db";
import {
  ALLOWED_IMAGE_TYPES,
  getOrganizationLogoKey,
  isAllowedContentType,
} from "./utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface UploadLogoParams {
  organizationId: string;
  contentType: string;
  // base64-encoded file contents
  data: string;
}

interface UploadLogoResponse {
  logoUrl: string;
}

export const uploadLogo = api(
  {
    method: "POST",
    path: "/upload/logo",
    auth: true,
    expose: true,
    bodyLimit: 5 * 1024 * 1024 * 2, // base64 inflates ~33%
  },
  async (params: UploadLogoParams): Promise<UploadLogoResponse> => {
    await requireOrganizationAdmin(params.organizationId);

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

    const key = getOrganizationLogoKey(params.organizationId);
    await avatarsBucket.upload(key, buffer, {
      contentType: params.contentType,
    });

    const logoUrl = avatarsBucket.publicUrl(key);

    const previous = await db.query.organizations.findFirst({
      where: { id: params.organizationId },
    });
    assertExists(previous, "Organization not found");

    await db
      .update(organizationsTable)
      .set({ logoUrl, logoKey: key })
      .where(eq(organizationsTable.id, params.organizationId));

    if (previous.logoKey && previous.logoKey !== key) {
      await avatarsBucket.remove(previous.logoKey);
    }

    return { logoUrl };
  }
);

interface DeleteLogoParams {
  organizationId: string;
}

export const deleteLogo = api(
  {
    method: "DELETE",
    path: "/upload/logo",
    auth: true,
    expose: true,
  },
  async (params: DeleteLogoParams): Promise<void> => {
    await requireOrganizationAdmin(params.organizationId);

    const previous = await db.query.organizations.findFirst({
      where: { id: params.organizationId },
    });
    assertExists(previous, "Organization not found");

    await db
      .update(organizationsTable)
      .set({ logoUrl: null, logoKey: null })
      .where(eq(organizationsTable.id, params.organizationId));

    if (previous.logoKey) {
      try {
        await avatarsBucket.remove(previous.logoKey);
      } catch (err) {
        if (!(err instanceof ObjectNotFound)) throw err;
      }
    }
  }
);
