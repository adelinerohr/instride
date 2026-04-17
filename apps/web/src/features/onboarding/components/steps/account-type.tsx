import { useStore } from "@tanstack/react-form";
import { UserIcon, UsersIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { FieldGroup } from "@/shared/components/ui/field";
import { withFieldGroup } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { defaultMemberOnboardingValues } from "../../lib/member/form";

export const AccountTypeStep = withFieldGroup({
  defaultValues: defaultMemberOnboardingValues.accountType,
  render: function Render({ group }) {
    const isGuardian = useStore(
      group.store,
      (state) => state.values.isGuardian
    );
    const isRider = useStore(group.store, (state) => state.values.isRider);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Account Type</h2>
          <p className="mt-1 text-muted-foreground">
            Let us know if you're signing up for yourself or as a guardian
          </p>
        </div>

        <FieldGroup>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Are you a parent or guardian?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    !isGuardian && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    group.setFieldValue("isGuardian", false);
                    group.setFieldValue("isRider", null);
                  }}
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <UserIcon className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Just Me</div>
                      <div className="text-xs text-muted-foreground">
                        I'm signing up for myself
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    isGuardian && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    group.setFieldValue("isGuardian", true);
                    group.setFieldValue("isRider", null); // Reset rider selection
                  }}
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <UsersIcon className="h-8 w-8" />
                    <div className="text-center">
                      <div className="font-medium">Parent/Guardian</div>
                      <div className="text-xs text-muted-foreground">
                        I'm managing for dependents
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {isGuardian && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Will you also be riding?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      isRider === true && "border-primary bg-primary/5"
                    )}
                    onClick={() => group.setFieldValue("isRider", true)}
                  >
                    <CardContent className="flex flex-col items-center gap-2 p-6">
                      <div className="font-medium">Yes</div>
                      <div className="text-xs text-muted-foreground text-center">
                        I'll ride and manage dependents
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      isRider === false && "border-primary bg-primary/5"
                    )}
                    onClick={() => group.setFieldValue("isRider", false)}
                  >
                    <CardContent className="flex flex-col items-center gap-2 p-6">
                      <div className="font-medium">No</div>
                      <div className="text-xs text-muted-foreground text-center">
                        I'm only managing dependents
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </FieldGroup>
      </div>
    );
  },
});
