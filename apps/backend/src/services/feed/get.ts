import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "./db";
import { GetFeedPostResponse, ListFeedPostsResponse } from "./types/contracts";

interface ListFeedRequest {
  searchQuery?: string;
  boardId?: string;
  authorMemberId?: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

interface ListFeedResponse extends ListFeedPostsResponse {
  nextCursor: {
    createdAt: string;
    id: string;
  } | null;
  hasMore: boolean;
}

export const listFeed = api(
  {
    method: "GET",
    path: "/feed",
    expose: true,
    auth: true,
  },
  async (request: ListFeedRequest): Promise<ListFeedResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const {
      searchQuery,
      boardId,
      authorMemberId,
      limit = 10,
      cursorCreatedAt,
      cursorId,
    } = request;

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const cursor =
      cursorCreatedAt && cursorId
        ? {
            createdAt: new Date(cursorCreatedAt),
            id: cursorId,
          }
        : null;

    const posts = await db.query.feedPosts.findMany({
      where: {
        organizationId,
        deletedAt: {
          isNull: true,
        },
        ...(boardId ? { boardId } : {}),
        ...(authorMemberId ? { authorMemberId } : {}),
        ...(searchQuery ? { text: { ilike: `%${searchQuery.trim()}%` } } : {}),
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: new Date(cursor.createdAt) } },
                {
                  AND: [
                    { createdAt: { eq: new Date(cursor.createdAt) } },
                    { id: { lt: cursor.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
        id: "desc",
      },
      limit: safeLimit + 1,
      with: {
        author: {
          with: {
            authUser: true,
          },
        },
        likes: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
          },
        },
        comments: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
            replies: {
              with: {
                member: {
                  with: {
                    authUser: true,
                  },
                },
              },
            },
          },
        },
        board: true,
      },
    });

    const hasMore = posts.length > safeLimit;
    const page = hasMore ? posts.slice(0, safeLimit) : posts;
    const last = page.at(-1);

    return {
      posts: page,
      nextCursor:
        hasMore && last
          ? {
              createdAt: last.createdAt.toISOString(),
              id: last.id,
            }
          : null,
      hasMore,
    };
  }
);

export const getFeedPost = api(
  {
    method: "GET",
    path: "/feed/post/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetFeedPostResponse> => {
    const post = await db.query.feedPosts.findFirst({
      where: { id },
      with: {
        author: {
          with: {
            authUser: true,
          },
        },
        comments: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
          },
        },
        board: true,
        likes: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw APIError.notFound("Post not found");
    }

    return { post };
  }
);
