import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordForm } from "@/shared/components/auth/forgot-password";

export const Route = createFileRoute("/auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPasswordForm />;
}
