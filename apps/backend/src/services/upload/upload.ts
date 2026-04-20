import { IncomingMessage, ServerResponse } from "http";

import busboy from "busboy";
import { eq } from "drizzle-orm";

import { authUsers } from "../auth/schema";
import { organizations } from "../organizations/schema";
import { avatarsBucket } from "./bucket";
import { db } from "./db";

interface UserAvatarOptions {
  target: "user";
  authUserId: string;
}

interface OrganizationAvatarOptions {
  target: "organization";
  organizationId: string;
}

type UploadOptions = UserAvatarOptions | OrganizationAvatarOptions;

export async function uploadFile(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  options: UploadOptions
) {
  const bb = busboy({
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  bb.on("file", async (_, file, info) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(info.mimeType)) {
      res.writeHead(400);
      res.end("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of file) {
      chunks.push(chunk);
    }

    const data = Buffer.concat(chunks);

    const ext = info.mimeType.split("/")[1];
    const key =
      options.target === "organization"
        ? `organizations/${options.organizationId}/logo.${ext}`
        : `users/${options.authUserId}/avatar.${ext}`;

    await avatarsBucket.upload(key, data, {
      contentType: info.mimeType,
    });
    const url = avatarsBucket.publicUrl(key);

    // Update the right table
    if (options.target === "organization") {
      await db
        .update(organizations)
        .set({
          logoUrl: url,
        })
        .where(eq(organizations.id, options.organizationId));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ url }));
  });

  bb.on("error", (error) => {
    res.writeHead(500);
    res.end(`Error: ${(error as Error).message}`);
  });

  req.pipe(bb);
}

export async function deleteFile(options: UploadOptions) {
  const key =
    options.target === "organization"
      ? `organizations/${options.organizationId}/logo`
      : `users/${options.authUserId}/avatar`;

  // List to find the actual file (since ext varies)
  for await (const obj of avatarsBucket.list({ prefix: key })) {
    await avatarsBucket.remove(obj.name);
  }

  if (options.target === "organization") {
    await db
      .update(organizations)
      .set({
        logoUrl: null,
      })
      .where(eq(organizations.id, options.organizationId));
  } else {
    await db
      .update(authUsers)
      .set({
        profilePictureUrl: null,
      })
      .where(eq(authUsers.id, options.authUserId));
  }
}
