import { forgotPasswordSchema } from "@instride/shared";
import { Link, linkOptions, useParams } from "@tanstack/react-router";
import { APIError } from "better-auth";

import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { buttonVariants } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FieldGroup } from "../ui/field";

export function ForgotPasswordForm() {
  const params = useParams({ strict: false });
  const orgSlug = params.slug;

  const resetPasswordLink = orgSlug
    ? linkOptions({
        to: "/org/$slug/auth/reset-password",
        params: { slug: orgSlug },
      })
    : linkOptions({ to: "/auth/reset-password" });

  const loginLink = orgSlug
    ? linkOptions({
        to: "/org/$slug/auth/login",
        params: { slug: orgSlug },
      })
    : linkOptions({ to: "/auth/login" });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const redirectTo = new URL(
          resetPasswordLink.to,
          window.location.origin
        ).toString();

        const { error } = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo,
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        const message =
          error instanceof APIError
            ? error.message
            : "Failed to request password reset";
        formApi.setErrorMap({
          onSubmit: {
            form: message,
            fields: {},
          },
        });
      }
    },
  });

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
        </CardHeader>
        <CardContent>
          <form.Subscribe
            selector={(state) => ({
              isSubmitSuccessful: state.isSubmitSuccessful,
              isSubmitting: state.isSubmitting,
              errorMap: state.errorMap,
            })}
          >
            {({ isSubmitSuccessful, isSubmitting, errorMap }) =>
              isSubmitSuccessful ? (
                <Alert variant="info" className="w-full">
                  <AlertTitle>Link sent</AlertTitle>
                  <AlertDescription>
                    We have sent you a link to continue. Please check your
                    inbox.
                  </AlertDescription>
                </Alert>
              ) : (
                <FieldGroup>
                  <form.AppField
                    name="email"
                    children={(field) => (
                      <field.TextField
                        label="Email"
                        placeholder="john@example.com"
                        variant="email"
                        autoComplete="email"
                        autoCapitalize="off"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errorMap.onSubmit?.form && (
                    <Alert variant="destructive">
                      <AlertTitle>{String(errorMap.onSubmit.form)}</AlertTitle>
                    </Alert>
                  )}
                </FieldGroup>
              )
            }
          </form.Subscribe>
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Rembered your password?</span>
          <Link {...loginLink} className={buttonVariants({ variant: "link" })}>
            Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
