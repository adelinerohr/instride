import { boardsOptions, feedOptions, membersOptions } from "@instride/api";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PostComposer } from "@/features/organization/components/feed/composer";
import { FeedFilters } from "@/features/organization/components/feed/filters";
import { Post } from "@/features/organization/components/feed/post";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  feedSearchParams,
  type FeedSearchParams,
} from "@/shared/lib/search/feed";

export const Route = createFileRoute("/org/$slug/(authenticated)/admin/feed")({
  component: RouteComponent,
  validateSearch: feedSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps: { search } }) => {
    const [feed, boards, trainers] = await Promise.all([
      context.queryClient.ensureInfiniteQueryData(
        feedOptions(context.organization.id).posts({
          searchQuery: search.query,
        })
      ),
      context.queryClient.ensureQueryData(boardsOptions.list()),
      context.queryClient.ensureQueryData(
        membersOptions(context.organization.id).trainers()
      ),
    ]);
    return { feed, boards, trainers };
  },
});

function RouteComponent() {
  const { organization, isPortal, membership, user } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      feedOptions(organization.id).posts({ searchQuery: search.query })
    );

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const { data: trainers, isLoading: isTrainersLoading } = useSuspenseQuery(
    membersOptions(organization.id).trainers()
  );
  const { data: boards, isLoading: isBoardsLoading } = useSuspenseQuery(
    boardsOptions.list()
  );

  const isLoading = isPending || isTrainersLoading || isBoardsLoading;

  const updateFilter = (updates: Partial<FeedSearchParams>) => {
    navigate({
      to: "/org/$slug/admin/feed",
      params: { slug: organization.slug },
      search: (prev) => ({
        ...prev,
        ...updates,
      }),
    });
  };

  const clearFilters = () => {
    navigate({
      to: "/org/$slug/admin/feed",
      params: { slug: organization.slug },
      search: undefined,
    });
  };

  return (
    <div className="p-4 pb-8 space-y-4">
      <FeedFilters
        search={search}
        onUpdateFilter={updateFilter}
        trainers={trainers}
        boards={boards}
      />
      {!isPortal && <PostComposer search={search} boards={boards} />}
      {isLoading ? (
        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Loading posts...</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {posts.length > 0 && !isLoading ? (
            posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                userMemberId={membership.id}
                user={user}
              />
            ))
          ) : (
            <Empty className="w-full border border-dashed">
              <EmptyHeader>
                <EmptyTitle>No posts found</EmptyTitle>
                <EmptyDescription>
                  No posts found for the selected filters.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>
      )}

      {posts.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            variant="outline"
            className="mx-auto self-center"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
