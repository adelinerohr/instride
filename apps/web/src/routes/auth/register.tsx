import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { RegisterForm } from "@/shared/components/auth/register-form";

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/register")({
  validateSearch: registerSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/dashboard";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <RegisterForm returnTo={returnTo} onSuccess={handleSuccess} />
    </div>
  );
}
