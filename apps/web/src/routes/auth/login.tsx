import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/shared/components/auth/login-form";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();
  const returnTo = search.redirect || "/";

  const handleSuccess = async () => {
    await router.invalidate();
    await navigate({ to: returnTo });
  };

  return (
    <LoginForm
      returnTo={returnTo}
      onSuccess={handleSuccess}
      prefillEmail={search.email}
    />
  );
}
