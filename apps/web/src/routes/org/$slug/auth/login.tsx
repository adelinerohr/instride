import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/shared/components/auth/login-form";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  invitationId: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/org/$slug/auth/login")({
  component: RouteComponent,
  validateSearch: loginSearchSchema,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  return <LoginForm returnTo={returnTo} onSuccess={handleSuccess} />;
}
