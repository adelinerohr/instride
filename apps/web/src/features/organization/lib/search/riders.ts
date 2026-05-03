import z from "zod";

export const riderSearchParams = z.object({
  query: z.string().optional(),
  levelId: z.string().optional(),
  boardId: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().optional().default(1),
});

export type RiderSearchParams = z.infer<typeof riderSearchParams>;
