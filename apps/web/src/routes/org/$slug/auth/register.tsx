import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/org/$slug/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/org/$slug/auth/register"!</div>;
}
