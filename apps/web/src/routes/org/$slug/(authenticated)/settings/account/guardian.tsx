import { guardianOptions, useChangeRole, type types } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  SlidersIcon,
  TrashIcon,
  UserPenIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import {
  GuardianControlsModal,
  guardianControlsModalHandler,
} from "@/features/organization/components/guardians/controls-modal";
import {
  EditDependentProfileModal,
  editDependentProfileModalHandler,
} from "@/features/organization/components/guardians/dependent-profile-modal";
import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
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
import { getInitials } from "@/shared/lib/utils/format";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/account/guardian"
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    const isGuardian = context.member.roles.includes(MembershipRole.GUARDIAN);

    if (isGuardian) {
      context.queryClient.ensureQueryData(guardianOptions.myDependents());
    }
  },
});

function RouteComponent() {
  const { member } = Route.useRouteContext();
  const { data: relationships } = useSuspenseQuery(
    guardianOptions.myDependents()
  );
  const toggleGuardianStatus = useChangeRole();

  const isGuardian = member.roles.includes(MembershipRole.GUARDIAN);
  const isRider = member.roles.includes(MembershipRole.RIDER);

  const handleToggleGuardianStatus = async () => {
    await toggleGuardianStatus.mutateAsync({
      memberId: member.id,
      request: {
        roles: isGuardian
          ? member.roles.filter((role) => role !== MembershipRole.GUARDIAN)
          : [...member.roles, MembershipRole.GUARDIAN],
      },
    });
  };

  const handleToggleRiderStatus = async () => {
    await toggleGuardianStatus.mutateAsync({
      memberId: member.id,
      request: {
        roles: isRider
          ? member.roles.filter((role) => role !== MembershipRole.RIDER)
          : [...member.roles, MembershipRole.RIDER],
      },
    });
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
                    <React.Fragment key={relationship.dependentMemberId}>
                      <DependentRow relationship={relationship} />
                    </React.Fragment>
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
              <Button variant="default">
                <PlusIcon />
                Add Dependent
              </Button>
            </CardFooter>
          </Card>
        </AnnotatedSection>
      </AnnotatedLayout>
    </div>
  );
}

interface DependentRowProps {
  relationship: types.GuardianRelationship;
}

export function DependentRow({ relationship }: DependentRowProps) {
  if (!relationship.dependent) return null;

  return (
    <Item
      variant="outline"
      className="cursor-pointer hover:bg-muted/50 not-first:rounded-t-none not-last:border-b-0 not-last:rounded-b-none"
    >
      <ItemMedia>
        <Avatar>
          <AvatarImage
            src={relationship.dependent.authUser?.image ?? undefined}
            alt={relationship.dependent.authUser?.name}
          />
          <AvatarFallback>
            {getInitials(relationship.dependent.authUser?.name)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{relationship.dependent.authUser?.name}</ItemTitle>
        <ItemDescription>
          {relationship.canBookLessons
            ? "Can book lessons"
            : "Cannot book lessons"}
          ,{" "}
          {relationship.canPostOnFeed
            ? "Can post on feed"
            : "Cannot post on feed"}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <EllipsisVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
            <DropdownMenuItem>
              <TrashIcon />
              Delete Dependent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
      <GuardianControlsModal />
      <EditDependentProfileModal />
    </Item>
  );
}
