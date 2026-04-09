import { ServiceBoardAssignmentWithService } from "./services";
import { MemberWithUser } from "./users";

export interface Board {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  canRiderAdd: boolean;
}

export interface BoardWithAssignmentsAndServices extends Board {
  assignments: BoardAssignmentWithMember[];
  serviceBoardAssignments: ServiceBoardAssignmentWithService[];
}

export interface BoardAssignment {
  id: string;
  createdAt: Date | string;
  boardId: string;
  memberId: string;
  isTrainer: boolean;
}

export interface BoardAssignmentWithMember extends BoardAssignment {
  member: MemberWithUser;
}
