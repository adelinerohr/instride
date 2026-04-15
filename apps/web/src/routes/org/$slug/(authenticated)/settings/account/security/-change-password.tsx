import { useRouter } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import z from "zod";

import { Card, CardContent } from "@/shared/components/ui/card";
import {
  InputGroupAddon,
  InputGroupButton,
} from "@/shared/components/ui/input-group";
import { useAppForm } from "@/shared/hooks/use-form";
import { authClient } from "@/shared/lib/auth/client";
import { passwordValidator } from "@/shared/lib/auth/password";

export function ChangePassword() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    validators: {
      onSubmit: z.object({
        currentPassword: z.string().min(1),
        newPassword: z
          .string()
          .min(1, "New password is required")
          .max(72, "Maximum 72 characters allowed")
          .refine((val) => passwordValidator.validate(val).success, {
            message: "New password does not meet the requirements",
          }),
      }),
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.changePassword({
        ...value,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error("Could not change password", {
          description: error.message,
        });
        return;
      }

      toast.success("Password changed successfully");
      form.reset();
      await router.invalidate();
    },
  });

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.AppField
            name="currentPassword"
            children={(field) => {
              const [show, setShow] = React.useState(false);
              return (
                <field.TextField
                  label="Current password"
                  autoComplete="current-password"
                  type={show ? "text" : "password"}
                  inputGroup
                >
                  <InputGroupAddon align="inline-start">
                    <LockIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={
                        show ? "Hide current password" : "Show current password"
                      }
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </field.TextField>
              );
            }}
          />
          <form.AppField
            name="newPassword"
            children={(field) => {
              const [show, setShow] = React.useState(false);
              return (
                <field.TextField
                  label="New password"
                  autoComplete="new-password"
                  type={show ? "text" : "password"}
                  inputGroup
                >
                  <InputGroupAddon align="inline-start">
                    <LockIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={
                        show ? "Hide new password" : "Show new password"
                      }
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </field.TextField>
              );
            }}
          />
          <form.AppForm>
            <form.SubmitButton
              label="Update password"
              loadingLabel="Updating password..."
            />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
