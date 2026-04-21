import {
  guardianOptions,
  membersOptions,
  questionnaireOptions,
  useChangeRole,
  waiverOptions,
} from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { differenceInYears } from "date-fns";
import {
  AlertCircleIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  SendIcon,
  SlidersIcon,
  UserPenIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import {
  AddDependentModal,
  addDependentModalHandler,
} from "@/features/onboarding/components/modals/add-dependent";
import {
  GuardianControlsModal,
  guardianControlsModalHandler,
} from "@/features/organization/components/guardians/controls-modal";
import {
  EditDependentProfileModal,
  editDependentProfileModalHandler,
} from "@/features/organization/components/guardians/dependent-profile-modal";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
} from "@/shared/components/ui/item";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/account/guardian"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    const isGuardian = context.member.roles.includes(MembershipRole.GUARDIAN);

    if (isGuardian) {
      await Promise.all([
        context.queryClient.ensureQueryData(guardianOptions.myDependents()),
        context.queryClient.ensureQueryData(questionnaireOptions.list()),
        context.queryClient.ensureQueryData(waiverOptions.list()),
      ]);
    }
  },
});

function RouteComponent() {
  const changeRole = useChangeRole();

  const [addDependentKey, setAddDependentKey] = React.useState(0);

  const { data: member } = useSuspenseQuery(membersOptions.me());
  const { data: relationships } = useSuspenseQuery(
    guardianOptions.myDependents()
  );

  const isGuardian = member.roles.includes(MembershipRole.GUARDIAN);
  const isRider = member.roles.includes(MembershipRole.RIDER);

  const handleToggleGuardianStatus = async () => {
    const nextRoles = isGuardian
      ? member.roles.filter((role) => role !== MembershipRole.GUARDIAN)
      : [...member.roles, MembershipRole.GUARDIAN];

    await changeRole.mutateAsync({
      memberId: member.id,
      request: { roles: nextRoles },
    });
  };

  const handleToggleRiderStatus = async () => {
    const nextRoles = isRider
      ? member.roles.filter((role) => role !== MembershipRole.RIDER)
      : [...member.roles, MembershipRole.RIDER];

    await changeRole.mutateAsync({
      memberId: member.id,
      request: { roles: nextRoles },
    });
  };

  const canInviteDependent = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const age = differenceInYears(new Date(), dob);
    return age >= 12;
  };

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <AlertCircleIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{isGuardian ? "Guardian" : "Not a guardian"}</ItemTitle>
            <ItemDescription>
              {isGuardian
                ? "If you want to remove your guardian status, please press the button."
                : "If you wish to become a guardian, please press the button."}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant={isGuardian ? "destructive" : "outline"}
              onClick={handleToggleGuardianStatus}
            >
              {isGuardian ? "Remove guardian status" : "Become a guardian"}
            </Button>
          </ItemActions>
        </Item>
      </div>
      <AnnotatedLayout
        className={!isGuardian ? "opacity-50 pointer-events-none" : ""}
      >
        <AnnotatedSection
          title="Guardian preferences"
          description="Set your preferences as a guardian."
        >
          <Card>
            <CardContent>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Are you a rider?</FieldLabel>
                  <FieldDescription>
                    If you are a rider, you will be able to book lessons for
                    yourself as well.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  checked={isRider}
                  onCheckedChange={handleToggleRiderStatus}
                  disabled={!isGuardian}
                />
              </Field>
            </CardContent>
          </Card>
        </AnnotatedSection>
        <Separator />
        <AnnotatedSection
          title="Dependents"
          description="Add your dependents to your account."
        >
          <Card>
            <CardContent>
              {relationships.length > 0 ? (
                <ItemGroup>
                  {relationships.map((relationship) => (
                    <Item variant="outline" key={relationship.id}>
                      <ItemMedia>
                        <UserAvatar
                          name={relationship.dependent.name}
                          image={relationship.dependent.image}
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{relationship.dependent.name}</ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" />}
                          >
                            <EllipsisVerticalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-fit">
                            <DialogTrigger
                              render={<DropdownMenuItem />}
                              nativeButton={false}
                              handle={editDependentProfileModalHandler}
                              payload={{ relationship }}
                            >
                              <UserPenIcon />
                              Edit Profile
                            </DialogTrigger>
                            <DialogTrigger
                              render={<DropdownMenuItem />}
                              nativeButton={false}
                              handle={guardianControlsModalHandler}
                              payload={{ relationship }}
                            >
                              <SlidersIcon />
                              Edit Controls
                            </DialogTrigger>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={
                                !canInviteDependent(
                                  relationship.dependent.dateOfBirth!
                                )
                              }
                            >
                              <SendIcon />
                              Invite Dependent
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UsersIcon />
                    </EmptyMedia>
                    <EmptyTitle>No dependents found</EmptyTitle>
                    <EmptyDescription>
                      Add a dependent to your account to get started.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
            <CardFooter className="flex w-full justify-end">
              <Button
                variant="default"
                onClick={() => {
                  setAddDependentKey((k) => k + 1);
                  addDependentModalHandler.open(null);
                }}
              >
                <PlusIcon />
                Add Dependent
              </Button>
            </CardFooter>
          </Card>
        </AnnotatedSection>
      </AnnotatedLayout>
      <GuardianControlsModal />
      <EditDependentProfileModal />
      <AddDependentModal key={addDependentKey} />
    </div>
  );
}
