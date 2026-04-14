import { api } from "encore.dev/api";

import { requireAuth } from "@/shared/auth";

import { deleteFile, uploadFile } from "./upload";

export const uploadUserAvatar = api.raw(
  {
    expose: true,
    method: "POST",
    path: "/upload/avatar/user",
    auth: true,
    bodyLimit: null,
  },
  async (req, res) => {
    const { userID } = requireAuth();
    await uploadFile(req, res, {
      target: "user",
      authUserId: userID,
    });
  }
);

export const deleteUserAvatar = api.raw(
  {
    expose: true,
    method: "DELETE",
    path: "/upload/avatar/user",
    auth: true,
  },
  async (req, res) => {
    const { userID } = requireAuth();
    await deleteFile({
      target: "user",
      authUserId: userID,
    });

    res.writeHead(200);
    res.end("User avatar deleted");
  }
);

export const uploadOrganizationLogo = api.raw(
  {
    expose: true,
    method: "POST",
    path: "/upload/avatar/organization",
    auth: true,
    bodyLimit: null,
  },
  async (req, res) => {
    const organizationId = new URLSearchParams(req.url).get("organizationId");
    if (!organizationId) {
      res.writeHead(400);
      res.end("Organization ID is required");
      return;
    }

    await uploadFile(req, res, {
      target: "organization",
      organizationId,
    });
  }
);

export const deleteOrganizationLogo = api.raw(
  {
    expose: true,
    method: "DELETE",
    path: "/upload/avatar/organization",
    auth: true,
  },
  async (req, res) => {
    const organizationId = new URLSearchParams(req.url).get("organizationId");
    if (!organizationId) {
      res.writeHead(400);
      res.end("Organization ID is required");
      return;
    }

    await deleteFile({
      target: "organization",
      organizationId,
    });

    res.writeHead(200);
    res.end("Organization logo deleted");
  }
);
