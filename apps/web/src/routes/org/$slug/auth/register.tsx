import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RegisterForm } from "@/shared/components/auth/register-form";
import { hardNavigateToInternalPath } from "@/shared/lib/navigation/links";

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/org/$slug/auth/register")({
  component: RouteComponent,
  validateSearch: registerSearchSchema,
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
    <RegisterForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
