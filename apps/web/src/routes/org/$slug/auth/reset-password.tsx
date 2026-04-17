import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { ResetPasswordForm } from "@/shared/components/auth/reset-password-form";

export const Route = createFileRoute("/org/$slug/auth/reset-password")({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().optional(),
  }),
});

function RouteComponent() {
  return <ResetPasswordForm />;
}
