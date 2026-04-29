import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/shared/components/auth/login-form";
import { getRootLink } from "@/shared/lib/navigation/links";

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
  const navigate = Route.useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/";

  const handleSuccess = async () => {
    await router.invalidate();
    await navigate(getRootLink(params.slug));
  };

  return (
    <LoginForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
