import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RegisterForm } from "@/shared/components/auth/register-form";

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
  invitationId: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/org/$slug/auth/register")({
  component: RouteComponent,
  validateSearch: registerSearchSchema,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { org } = Route.useRouteContext();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/dashboard";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <RegisterForm
        orgName={org.name}
        returnTo={returnTo}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
