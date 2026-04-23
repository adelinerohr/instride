import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RegisterForm } from "@/shared/components/auth/register-form";

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/org/$slug/auth/register")({
  component: RouteComponent,
  validateSearch: registerSearchSchema,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/dashboard";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  return (
    <RegisterForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
