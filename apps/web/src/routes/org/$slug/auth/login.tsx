import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/shared/components/auth/login-form";
import { hardNavigateToInternalPath } from "@/shared/lib/navigation/links";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/org/$slug/auth/login")({
  component: RouteComponent,
  validateSearch: loginSearchSchema,
});

function RouteComponent() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const fallback = `/org/${params.slug}`;
  const returnTo = search.redirect || fallback;

  const handleSuccess = () => {
    hardNavigateToInternalPath(returnTo, fallback);
  };

  return (
    <LoginForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
