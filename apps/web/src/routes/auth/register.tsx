import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RegisterForm } from "@/shared/components/auth/register-form";
import { hardNavigateToInternalPath } from "@/shared/lib/navigation/links";

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/auth/register")({
  validateSearch: registerSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const returnTo = search.redirect || "/dashboard";

  const handleSuccess = () => {
    hardNavigateToInternalPath(returnTo, "/dashboard");
  };

  return (
    <RegisterForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
