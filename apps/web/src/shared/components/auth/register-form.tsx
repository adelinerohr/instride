import { registerSchema } from "@instride/shared";
import {
  Link,
  linkOptions,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { BetterAuthError } from "better-auth";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";
import { oAuthProviders } from "@/shared/lib/auth/oauth-providers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface RegisterFormProps {
  returnTo: string;
  onSuccess: () => void;
  prefillEmail?: string;
}

export function RegisterForm({
  returnTo,
  onSuccess,
  prefillEmail,
}: RegisterFormProps) {
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const orgSlug = params.slug;

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: prefillEmail || "",
      password: "",
      confirmPassword: "",
    },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.warning("Please check your email for verification");
          },
          onError: (error) => {
            toast.error(
              error instanceof BetterAuthError
                ? error.message
                : "Failed to register"
            );
          },
        }
      );
    },
  });

  const loginPath = orgSlug
    ? linkOptions({
        to: "/org/$slug/auth/login",
        params: { slug: orgSlug },
        search: {
          redirect: search.redirect,
          email: search.email,
        },
      })
    : linkOptions({
        to: "/auth/login",
        search: {
          redirect: search.redirect,
          email: search.email,
        },
      });

  const handleGoogleSignIn = async () => {
    const isDev = !import.meta.env.PROD;

    // Build callback URL with org context
    const baseUrl = isDev
      ? "http://localhost:3000" // Dev uses same domain
      : "https://instrideapp.com"; // Prod uses canonical domain

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

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome!</CardTitle>
        <CardDescription>
          Fill in the form to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup>
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

            <FieldSeparator>OR</FieldSeparator>

            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField label="Name" placeholder="John Doe" />
              )}
            />
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

            <form.AppForm>
              <form.SubmitButton label="Create account" className="w-full" />
            </form.AppForm>

            <FieldDescription className="text-center px-6">
              Already have an account?
              <Link
                {...loginPath}
                className={buttonVariants({ variant: "link" })}
              >
                Sign in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
