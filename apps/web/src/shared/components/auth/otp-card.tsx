import { otpSchema } from "@instride/shared";
import {
  Link,
  linkOptions,
  useParams,
  useSearch,
} from "@tanstack/react-router";

import { useAppForm } from "@/shared/hooks/use-form";

import { Alert, AlertTitle } from "../ui/alert";
import { buttonVariants } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldLabel } from "../ui/field";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
  InputOTPSeparator,
} from "../ui/input-otp";

export function OtpCard() {
  const search = useSearch({ strict: false });
  const { slug, invitationId } = useParams({ strict: false });

  const getRedirectLink = () => {
    if (slug && invitationId) {
      return linkOptions({
        to: "/org/$slug/invitation/$invitationId",
        params: { slug, invitationId },
      });
    }
    if (slug) {
      return linkOptions({
        to: "/org/$slug",
        params: { slug },
      });
    }
    return linkOptions({
      to: "/",
    });
  };

  const loginLink = slug
    ? linkOptions({
        to: "/org/$slug/auth/login",
        params: { slug },
      })
    : linkOptions({ to: "/auth/login" });

  const form = useAppForm({
    defaultValues: {
      code: "",
    },
    validators: {
      onSubmit: otpSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <Card className="w-full border-transparent px-4 py-8 dark:border-border">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">
            Verify your account
          </CardTitle>
          <CardDescription>
            Enter the one-time password from your authenticator app to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field
            name="code"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>One-time password</FieldLabel>
                <InputOTP
                  maxLength={6}
                  autoComplete="one-time-code"
                  onChange={(value) => {
                    field.handleChange(value);
                    form.handleSubmit();
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot className="size-10 text-lg" index={0} />
                    <InputOTPSlot className="size-10 text-lg" index={1} />
                    <InputOTPSlot className="size-10 text-lg" index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="opacity-40" />
                  <InputOTPGroup>
                    <InputOTPSlot className="size-10 text-lg" index={3} />
                    <InputOTPSlot className="size-10 text-lg" index={4} />
                    <InputOTPSlot className="size-10 text-lg" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
            )}
          />
          <form.Subscribe selector={(state) => state.errorMap}>
            {(errorMap) =>
              errorMap.onSubmit?.form && (
                <Alert variant="destructive">
                  <AlertTitle>{String(errorMap.onSubmit.form)}</AlertTitle>
                </Alert>
              )
            }
          </form.Subscribe>
        </CardContent>
        <CardFooter className="flex justify-center gap-1 text-muted-foreground text-sm">
          <Link {...loginLink} className={buttonVariants({ variant: "link" })}>
            Go to login page
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
