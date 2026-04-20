import { useSignInEmail, useSignInSocial } from "@instride/api";
import { loginSchema } from "@instride/shared";
import { Link, linkOptions, useParams } from "@tanstack/react-router";
import { APIError } from "better-auth";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/shared/components/ui/field";
import { Separator } from "@/shared/components/ui/separator";
import { useAppForm } from "@/shared/hooks/use-form";
import { oAuthProviders } from "@/shared/lib/auth/oauth-providers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface LoginFormProps {
  returnTo: string;
  onSuccess: () => void;
}

export function LoginForm({ returnTo, onSuccess }: LoginFormProps) {
  const params = useParams({ strict: false });
  const signInEmail = useSignInEmail();
  const signInSocial = useSignInSocial();

  const orgSlug = params.slug;

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: ({ value }) => {
      signInEmail.mutate(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            onSuccess();
          },
          onError: (error) => {
            toast.error(
              error instanceof APIError ? error.message : "Failed to sign in"
            );
          },
        }
      );
    },
  });

  const registerPath = orgSlug
    ? linkOptions({
        to: "/org/$slug/auth/register",
        params: { slug: orgSlug },
      })
    : linkOptions({
        to: "/auth/register",
      });

  const handleGoogleSignIn = () => {
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

    signInSocial.mutate({
      provider: "google",
      callbackURL: callbackUrl.toString(),
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
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
            <form.SubmitButton
              label="Sign in"
              loadingLabel="Signing in..."
              className="w-full"
            />
          </form.AppForm>

          <FieldDescription className="text-center px-6">
            Don't have an account?
            <Link
              {...registerPath}
              className={buttonVariants({ variant: "link" })}
            >
              Create one
            </Link>
          </FieldDescription>
        </form>
      </CardContent>
    </Card>
  );
}
