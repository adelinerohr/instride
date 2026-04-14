import {
  Board,
  BoardAssignment,
  Service,
  ServiceBoardAssignment,
  ServiceTrainerAssignment,
} from "./models";

export interface ListBoardsResponse {
  boards: Board[];
}

export interface GetBoardResponse {
  board: Board;
}

export interface GetBoardAssignmentResponse {
  assignment: BoardAssignment;
}

export interface ListBoardAssignmentsResponse {
  assignments: BoardAssignment[];
}

export interface ListServicesResponse {
  services: Service[];
}

export interface GetServiceResponse {
  service: Service;
}

export interface ListTrainerServiceAssignmentsResponse {
  assignments: ServiceTrainerAssignment[];
}

export interface GetTrainerServiceAssignmentResponse {
  assignment: ServiceTrainerAssignment;
}

export interface ListBoardServiceAssignmentsResponse {
  assignments: ServiceBoardAssignment[];
}

export interface GetBoardServiceAssignmentResponse {
  assignment: ServiceBoardAssignment;
}
