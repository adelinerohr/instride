import { type Member } from "@instride/api";
import { format } from "date-fns";
import { CalendarIcon, MailIcon, PencilIcon, PhoneIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import { getInitials } from "@/shared/lib/utils/format";

import { RiderBoardsTab } from "./boards";
import { RiderLevel } from "./level";

interface RiderOverviewProps {
  member: Member;
}

export function RiderOverview({ member }: RiderOverviewProps) {
  return (
    <div className="bg-card border rounded-md h-fit">
      <div className="flex flex-col items-center justify-center gap-2 p-8">
        <Avatar className="size-1/4">
          <AvatarImage
            src={member.authUser?.image ?? undefined}
            alt={member.authUser?.name ?? ""}
          />
          <AvatarFallback>
            {getInitials(member.authUser?.name ?? "")}
          </AvatarFallback>
        </Avatar>
        <h4 className="text-lg font-semibold lg:text-2xl">
          {member.authUser?.name ?? ""}
        </h4>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CalendarIcon className="size-3" />
          <span>Joined {format(member.createdAt, "MMMM d, yyyy")}</span>
        </div>
      </div>
      <Separator />
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium">Personal Information</h5>
          <Button variant="ghost" size="icon-sm">
            <PencilIcon className="size-4" />
          </Button>
        </div>
        <Table>
          <TableBody>
            <TableRow className="border-b-0">
              <TableCell className="flex items-center gap-2 text-muted-foreground">
                <MailIcon className="size-4" />
                <span>Email</span>
              </TableCell>
              <TableCell>
                <span>{member.authUser?.email ?? "No email set"}</span>
              </TableCell>
            </TableRow>
            <TableRow className="border-b-0">
              <TableCell className="flex items-center gap-2 text-muted-foreground">
                <PhoneIcon className="size-4" />
                <span>Phone</span>
              </TableCell>
              <TableCell>
                <span>{member.authUser?.phone ?? "No phone number set"}</span>
              </TableCell>
            </TableRow>
            {/*
            <TableRow className="border-b-0">
              <TableCell className="flex items-center gap-2 text-muted-foreground">
                <CakeIcon className="size-4" />
                <span>Birthday</span>
              </TableCell>
              <TableCell>
                <span>
                  {member.authUser.dateOfBirth
                    ? format(member.user.dateOfBirth, 'MMMM d, yyyy')
                    : 'No birthday set'}
                </span>
              </TableCell>
            </TableRow>
            <TableRow className="border-b-0">
              <TableCell className="flex items-center gap-2 text-muted-foreground">
                <GiftIcon className="size-4" />
                <span>Age</span>
              </TableCell>
              <TableCell>
                <span>
                  {member.authUser.dateOfBirth
                    ? differenceInYears(new Date(), member.authUser.dateOfBirth)
                    : 'No age set'}
                </span>
              </TableCell>
            </TableRow>
            */}
          </TableBody>
        </Table>
      </div>
      <Separator />
      <RiderLevel member={member} />
      <Separator />
      <RiderBoardsTab member={member} />
    </div>
  );
}
