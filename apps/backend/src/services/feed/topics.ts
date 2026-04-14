import { Topic } from "encore.dev/pubsub";

export interface PostCreatedEvent {
  postId: string;
  organizationId: string;
  authorMemberId: string;
  content: string;
  createdAt: string;
}

export const postCreated = new Topic<PostCreatedEvent>("post-created", {
  deliveryGuarantee: "at-least-once",
});
