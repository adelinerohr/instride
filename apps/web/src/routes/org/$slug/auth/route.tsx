import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/org/$slug/auth"!</div>;
}
