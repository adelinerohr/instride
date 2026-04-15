import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { FieldGroup, FieldSet } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";

export const Route = createFileRoute("/org/$slug/(unauthenticated)/login")({
  component: RouteComponent,
});

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });
      navigate({ to: "/org/$slug", params: { slug } });
    },
  });

  const handleGoogle = async () => {
    await authClient.signIn.social({ provider: "google" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Instride
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          type="button"
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldSet>
            <FieldGroup>
              <form.AppField
                name="email"
                children={(field) => (
                  <field.TextField
                    label="Email"
                    placeholder="you@example.com"
                  />
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.TextField
                    label="Password"
                    type="password"
                    placeholder="********"
                  />
                )}
              />
            </FieldGroup>
          </FieldSet>

          <form.AppForm>
            <form.SubmitButton label="Sign in" loadingLabel="Signing in..." />
          </form.AppForm>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-foreground underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
