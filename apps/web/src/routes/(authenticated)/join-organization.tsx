import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/join-organization")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authenticated)/join-organization"!</div>;
}
