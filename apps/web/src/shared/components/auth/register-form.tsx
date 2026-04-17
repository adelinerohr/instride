import { registerSchema } from "@instride/shared";
import { Link, linkOptions, useParams } from "@tanstack/react-router";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import { FieldGroup, FieldSet } from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";
import { oAuthProviders } from "@/shared/lib/auth/oauth-providers";

interface RegisterFormProps {
  orgName?: string;
  returnTo: string;
  onSuccess: () => void;
}

export function RegisterForm({
  orgName,
  returnTo,
  onSuccess,
}: RegisterFormProps) {
  const params = useParams({ strict: false });
  const orgSlug = params.slug;

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      });
      onSuccess();
    },
  });

  const loginPath = orgSlug
    ? linkOptions({
        to: "/org/$slug/auth/login",
        params: { slug: orgSlug },
      })
    : linkOptions({
        to: "/auth/login",
      });

  const handleGoogleSignIn = async () => {
    const isDev = !import.meta.env.PROD;

    // Build callback URL with org context
    const baseUrl = isDev
      ? "http://localhost:3000" // Dev uses same domain
      : "https://app.instride.vercel.com"; // Prod uses canonical domain

    const callbackUrl = new URL("/auth/callback", baseUrl);

    if (orgSlug) {
      callbackUrl.searchParams.set("orgSlug", orgSlug);
    }
    callbackUrl.searchParams.set("returnTo", returnTo);

    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl.toString(),
    });
  };

  const displayName =
    orgName || (orgSlug ? formatOrgName(orgSlug) : "Instride");

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to {displayName}!
        </h1>
        <p className="text-sm text-muted-foreground">Create your account</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isSubmitting}
            >
              <oAuthProviders.google.icon />
              Continue with Google
            </Button>
          )}
        </form.Subscribe>

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <FieldSet>
          <FieldGroup>
            <form.AppField
              name="email"
              children={(field) => (
                <field.TextField label="Email" placeholder="you@example.com" />
              )}
            />
            <form.AppField
              name="password"
              children={(field) => (
                <field.PasswordField
                  label="Password"
                  showRequirements
                  placeholder="********"
                  autoComplete="new-password"
                />
              )}
            />
            <form.AppField
              name="confirmPassword"
              children={(field) => (
                <field.PasswordField
                  label="Confirm Password"
                  placeholder="********"
                  autoComplete="confirm-password"
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
        Already have an account?{" "}
        <Link {...loginPath} className={buttonVariants({ variant: "link" })}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

// Helper to format slug into readable name
function formatOrgName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
