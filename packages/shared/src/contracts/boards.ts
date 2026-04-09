import {
  Board,
  BoardAssignment,
  BoardWithAssignmentsAndServices,
} from "../interfaces/boards";

export interface CreateBoardRequest {
  name: string;
  canRiderAdd?: boolean | undefined;
  organizationId: string;
}

export interface UpdateBoardRequest {
  name: string;
  organizationId: string;
  canRiderAdd: boolean;
  trainerIds: { id: string }[];
  serviceIds: { id: string }[];
}

export interface CreateBoardAssignmentRequest {
  memberId: string;
  isTrainer?: boolean | undefined;
  organizationId: string;
}

export interface UpdateBoardAssignmentRequest {
  id: string;
  data: Partial<CreateBoardAssignmentRequest>;
}

export interface CreateBoardResponse {
  board: Board;
}

export interface CreateBoardAssignmentResponse {
  assignment: BoardAssignment;
}

export interface UpdateBoardResponse {
  board: Board;
}

export interface UpdateBoardAssignmentResponse {
  assignment: BoardAssignment;
}

export interface GetBoardResponse {
  board: BoardWithAssignmentsAndServices;
}

export interface GetBoardsResponse {
  boards: Board[];
}

export interface GetBoardAssignmentResponse {
  assignment: BoardAssignment;
}

export interface GetBoardAssignmentsResponse {
  assignments: BoardAssignment[];
}
