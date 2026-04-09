import { Board } from "./boards";
import { MemberWithUser } from "./users";

export interface Service {
  id: string;
  name: string;
  createdAt: Date | string;
  duration: number;
  updatedAt: Date | string;
  organizationId: string;
  description: string | null;
  price: number;
  creditPrice: number;
  creditAdditionalPrice: number | null;
  maxRiders: number;
  isPrivate: boolean;
  canRecurBook: boolean;
  isRestricted: boolean;
  restrictedToLevelId: string | null;
  isAllTrainers: boolean;
  canRiderAdd: boolean;
  isActive: boolean;
}

export interface ServiceBoardAssignment {
  id: string;
  createdAt: Date | string;
  organizationId: string;
  boardId: string;
  isActive: boolean;
  serviceId: string;
}

export interface ServiceBoardAssignmentWithBoard extends ServiceBoardAssignment {
  board: Board;
}

export interface ServiceBoardAssignmentWithService extends ServiceBoardAssignment {
  service: Service;
}

export interface ServiceTrainerAssignment {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  trainerId: string;
  isActive: boolean;
  serviceId: string;
}

export interface ServiceTrainerAssignmentWithMember extends ServiceTrainerAssignment {
  trainer: MemberWithUser;
}

export interface ServiceWithAssignments extends Service {
  boardAssignments: ServiceBoardAssignmentWithBoard[];
  trainerAssignments: ServiceTrainerAssignment[];
}
