import type {
  GetFeedPostResponse,
  ListFeedRequest,
  ListFeedResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { feedService } from "./feed.service";
import { toFeedPost } from "./mappers";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const listFeed = api(
  { method: "GET", path: "/feed", expose: true, auth: true },
  async (request: ListFeedRequest): Promise<ListFeedResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const safeLimit = Math.min(
      Math.max(request.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const cursor =
      request.cursorCreatedAt && request.cursorId
        ? {
            createdAt: new Date(request.cursorCreatedAt),
            id: request.cursorId,
          }
        : undefined;

    // Fetch one extra row to detect "hasMore"
    const rows = await feedService.listPosts({
      organizationId,
      searchQuery: request.searchQuery,
      boardId: request.boardId,
      authorMemberId: request.authorMemberId,
      cursor,
      limit: safeLimit + 1,
    });

    const hasMore = rows.length > safeLimit;
    const page = hasMore ? rows.slice(0, safeLimit) : rows;
    const last = page.at(-1);

    return {
      posts: page.map(toFeedPost),
      nextCursor:
        hasMore && last
          ? {
              createdAt:
                last.createdAt instanceof Date
                  ? last.createdAt.toISOString()
                  : last.createdAt,
              id: last.id,
            }
          : null,
      hasMore,
    };
  }
);

export const getFeedPost = api(
  { method: "GET", path: "/feed/post/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetFeedPostResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const post = await feedService.findOnePost(id, organizationId);
    return { post: toFeedPost(post) };
  }
);
