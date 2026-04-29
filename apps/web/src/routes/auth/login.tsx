import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/shared/components/auth/login-form";
import { hardNavigateToInternalPath } from "@/shared/lib/navigation/links";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const returnTo = search.redirect || "/";

  const handleSuccess = () => {
    hardNavigateToInternalPath(returnTo, "/");
  };

  return (
    <LoginForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
