import { Bucket } from "encore.dev/storage/objects";

export const avatarsBucket = new Bucket("avatars", {
  versioned: false,
  public: true, // Served directly via CDN, no signed URLs needed
});
