import { organizationOptions } from "@instride/api";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
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
  // Fetch org data to display name and verify it exists
  loader: async ({ context, params }) => {
    try {
      const org = await context.queryClient.ensureQueryData(
        organizationOptions.bySlug(params.slug)
      );

      if (!org) {
        throw notFound();
      }

      return { org };
    } catch {
      throw notFound();
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { org } = Route.useLoaderData();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/dashboard";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <LoginForm
        orgName={org.name}
        returnTo={returnTo}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
