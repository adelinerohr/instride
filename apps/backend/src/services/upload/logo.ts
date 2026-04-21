import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { assertExists } from "@/shared/utils/validation";

import { requireOrganizationAdmin } from "../auth/gates";
import { organizations as organizationsTable } from "../organizations/schema";
import { avatarsBucket } from "./bucket";
import { db } from "./db";
import {
  getOrganizationLogoKey,
  getOrganizationLogoPrefix,
  isAllowedContentType,
  ALLOWED_IMAGE_TYPES,
} from "./utils";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const UPLOAD_TTL_SECONDS = 300; // 5 minutes

export interface StartUploadLogoParams {
  organizationId: string;
  contentType: string;
  size: number;
}

export interface StartUploadLogoResponse {
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

export const startUploadLogo = api(
  {
    method: "POST",
    path: "/upload/logo",
    auth: true,
    expose: true,
  },
  async (params: StartUploadLogoParams): Promise<StartUploadLogoResponse> => {
    await requireOrganizationAdmin(params.organizationId);

    if (!isAllowedContentType(params.contentType, ALLOWED_IMAGE_TYPES)) {
      throw APIError.invalidArgument("Invalid file type");
    }

    if (params.size <= 0) {
      throw APIError.invalidArgument("File size must be greater than 0");
    }

    if (params.size > MAX_SIZE_BYTES) {
      throw APIError.invalidArgument("File too large (max 5MB)");
    }

    const key = getOrganizationLogoKey(params.organizationId);
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

interface ConfirmLogoUploadParams {
  organizationId: string;
  key: string;
}

interface ConfirmLogoUploadResponse {
  logoUrl: string;
}

export const confirmLogoUpload = api(
  {
    method: "POST",
    path: "/upload/logo/confirm",
    auth: true,
    expose: true,
  },
  async (
    params: ConfirmLogoUploadParams
  ): Promise<ConfirmLogoUploadResponse> => {
    await requireOrganizationAdmin(params.organizationId);

    const expectedPrefix = getOrganizationLogoPrefix(params.organizationId);
    if (!params.key.startsWith(expectedPrefix)) {
      throw APIError.permissionDenied("Key does not match organization");
    }

    const exists = await avatarsBucket.exists(params.key);
    assertExists(exists, "Logo file not found");

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

    const logoUrl = avatarsBucket.publicUrl(params.key);

    const previous = await db.query.organizations.findFirst({
      where: {
        id: params.organizationId,
      },
    });

    assertExists(previous, "Organization not found");

    await db
      .update(organizationsTable)
      .set({ logoUrl: logoUrl, logoKey: params.key })
      .where(eq(organizationsTable.id, params.organizationId));

    if (previous.logoKey && previous.logoKey !== params.key) {
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
      where: {
        id: params.organizationId,
      },
    });

    assertExists(previous, "Organization not found");

    await db
      .update(organizationsTable)
      .set({ logoUrl: null, logoKey: null })
      .where(eq(organizationsTable.id, params.organizationId));

    if (previous.logoKey) {
      await avatarsBucket.remove(previous.logoKey);
    }
  }
);
