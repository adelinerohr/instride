import { z } from "zod";

export const feedSearchParams = z.object({
  // Filters
  query: z.string().optional(),
  authors: z.array(z.string()).optional(),
  boards: z.array(z.string()).optional(),

  // Comments modal
  postId: z.string().optional(),
});

export type FeedSearchParams = z.infer<typeof feedSearchParams>;
