import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/(authenticated)/settings/")({
  component: () => null,
  beforeLoad: async ({ params }) => {
    throw redirect({
      to: "/org/$slug/settings/account/profile",
      params: { slug: params.slug },
    });
  },
});
