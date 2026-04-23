import { boardsOptions, feedOptions, membersOptions } from "@instride/api";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PostComposer } from "@/features/organization/components/feed/composer";
import { FeedFilters } from "@/features/organization/components/feed/filters";
import { Post } from "@/features/organization/components/feed/post";
import { Page, PageBody, PageHeader } from "@/shared/components/layout/page";
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
import { feedSearchParams } from "@/shared/lib/search/feed";

export const Route = createFileRoute("/org/$slug/(authenticated)/admin/feed")({
  component: RouteComponent,
  validateSearch: feedSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps: { search } }) => {
    const [feed, boards, trainers] = await Promise.all([
      context.queryClient.ensureInfiniteQueryData(
        feedOptions.posts({
          searchQuery: search.query,
        })
      ),
      context.queryClient.ensureQueryData(boardsOptions.list()),
      context.queryClient.ensureQueryData(membersOptions.trainers()),
    ]);
    return { feed, boards, trainers };
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(feedOptions.posts({ searchQuery: search.query }));

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const clearFilters = () => {
    navigate({
      to: "/org/$slug/admin/feed",
      params: { slug: organization.slug },
      search: undefined,
    });
  };

  return (
    <Page className="min-h-0 flex-1">
      <PageHeader title="Feed" />
      <PageBody className="space-y-4">
        <FeedFilters key={search.query ?? "no-query"} />
        <PostComposer />
        {isPending ? (
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
            {posts.length > 0 && !isPending ? (
              posts.map((post) => <Post key={post.id} post={post} />)
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
      </PageBody>
    </Page>
  );
}
