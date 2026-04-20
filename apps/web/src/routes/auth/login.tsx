import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/shared/components/auth/login-form";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/dashboard";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  return <LoginForm returnTo={returnTo} onSuccess={handleSuccess} />;
}
