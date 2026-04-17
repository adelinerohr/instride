import { resetPasswordSchema } from "@instride/shared";
import {
  Link,
  linkOptions,
  redirect,
  useParams,
  useRouteContext,
  useSearch,
} from "@tanstack/react-router";
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

export function ResetPasswordForm() {
  const { user } = useRouteContext({ strict: false });
  const search = useSearch({ strict: false });
  const params = useParams({ strict: false });
  const orgSlug = params.slug;

  const loginLink = orgSlug
    ? linkOptions({ to: "/org/$slug/auth/login", params: { slug: orgSlug } })
    : linkOptions({ to: "/auth/login" });

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { error } = await authClient.resetPassword({
          token: search.token ?? undefined,
          newPassword: value.password,
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        const message =
          error instanceof APIError
            ? error.message
            : "Failed to reset password";
        formApi.setErrorMap({
          onSubmit: { form: message, fields: {} },
        });
      }
    },
  });

  if (!user) {
    redirect(loginLink);
  }

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
                    name="password"
                    children={(field) => (
                      <field.PasswordField
                        label="New Password"
                        placeholder="New Password"
                        showRequirements
                        autoComplete="new-password"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  <form.AppField
                    name="confirmPassword"
                    children={(field) => (
                      <field.PasswordField
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        showRequirements={true}
                        autoComplete="new-password"
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
