import type { Level, RiderSummary, TrainerSummary } from "./organizations";

// ============================================================================
// Entities
// ============================================================================

export interface BoardSummary {
  id: string;
  organizationId: string;
  name: string;
  canRiderAdd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Board extends BoardSummary {
  assignments: BoardAssignment[];
  serviceBoardAssignments: ServiceBoardAssignment[];
}

export interface BoardAssignment {
  id: string;
  organizationId: string;
  boardId: string;
  trainerId: string | null;
  riderId: string | null;
  createdAt: string;
  trainer: TrainerSummary | null;
  rider: RiderSummary | null;
}

export interface BoardAssignmentSummary {
  id: string;
  organizationId: string;
  boardId: string;
  trainerId: string | null;
  riderId: string | null;
  createdAt: string;
  board: BoardSummary;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  creditPrice: number;
  creditAdditionalPrice: number | null;
  maxRiders: number;
  isPrivate: boolean;
  isRestricted: boolean;
  canRiderAdd: boolean;
  canRecurBook: boolean;
  isAllTrainers: boolean;
  isActive: boolean;
  restrictedToLevelId: string | null;
  createdAt: string;
  updatedAt: string;
  restrictedToLevel: Level | null;
  boardAssignments: ServiceBoardAssignment[];
  trainerAssignments: ServiceTrainerAssignment[];
}

export interface ServiceBoardAssignment {
  id: string;
  organizationId: string;
  serviceId: string;
  boardId: string;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceTrainerAssignment {
  id: string;
  organizationId: string;
  serviceId: string;
  trainerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Board requests + responses
// ============================================================================

export interface ListBoardsRequest {
  riderId?: string;
  riderIds?: string[];
  trainerId?: string;
}

export interface CreateBoardRequest {
  name: string;
  canRiderAdd?: boolean;
  trainerIds?: string[];
  riderIds?: string[];
  serviceIds?: string[];
}

export interface UpdateBoardRequest {
  boardId: string;
  name?: string;
  canRiderAdd?: boolean;
  trainerIds?: string[];
  riderIds?: string[];
  serviceIds?: string[];
}

export interface ListBoardsResponse {
  boards: Board[];
}

export interface GetBoardResponse {
  board: Board;
}

export interface ListBoardsForRiderRequest {
  riderId: string;
  canRiderAdd?: boolean;
}

export interface ListBoardsForRiderResponse {
  boards: Board[];
}

export interface ListBoardsForTrainerRequest {
  trainerId: string;
}

export interface ListBoardsForTrainerResponse {
  boards: Board[];
}

// ============================================================================
// Board assignment requests + responses
// ============================================================================

export interface AssignToBoardRequest {
  boardId: string;
  trainerId?: string;
  riderId?: string;
}

export interface ListBoardAssignmentsRequest {
  boardId: string;
  role?: "trainer" | "rider"; // filter, optional; omit = both
}

export interface GetBoardAssignmentResponse {
  assignment: BoardAssignment;
}

export interface ListBoardAssignmentsResponse {
  assignments: BoardAssignment[];
}

// ============================================================================
// Service requests + responses
// ============================================================================

export interface ListServicesRequest {
  trainerId?: string;
  boardId?: string;
}

export interface CreateServiceRequest {
  name: string;
  duration: number;
  price: number;
  creditPrice: number;
  maxRiders: number;
  description?: string | null;
  isRestricted?: boolean;
  canRiderAdd?: boolean;
  creditAdditionalPrice?: number | null;
  isPrivate?: boolean;
  canRecurBook?: boolean;
  restrictedToLevelId?: string | null;
  isAllTrainers?: boolean;
  isActive?: boolean;
  boardIds?: string[];
  trainerIds?: string[];
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id: string;
}

export interface ListServicesResponse {
  services: Service[];
}

export interface GetServiceResponse {
  service: Service;
}

// ============================================================================
// Service assignment requests + responses
// ============================================================================
// Split into separate endpoints for trainer and board to avoid the tagged union.

export interface AssignTrainerToServiceRequest {
  serviceId: string;
  trainerId: string;
}

export interface AssignBoardToServiceRequest {
  serviceId: string;
  boardId: string;
}

export interface ListServiceTrainerAssignmentsRequest {
  trainerId?: string;
  serviceId?: string;
}

export interface ListServiceBoardAssignmentsRequest {
  boardId?: string;
  serviceId?: string;
}

export interface GetServiceTrainerAssignmentResponse {
  assignment: ServiceTrainerAssignment;
}

export interface GetServiceBoardAssignmentResponse {
  assignment: ServiceBoardAssignment;
}

export interface ListServiceTrainerAssignmentsResponse {
  assignments: ServiceTrainerAssignment[];
}

export interface ListServiceBoardAssignmentsResponse {
  assignments: ServiceBoardAssignment[];
}
