import { Level, Rider, Trainer } from "@/services/organizations/types/models";

export interface Board {
  organizationId: string;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  canRiderAdd: boolean;
  assignments?: BoardAssignment[] | null;
  serviceBoardAssignments?: ServiceBoardAssignment[] | null;
}

export interface BoardAssignment {
  boardId: string;
  id: string;
  createdAt: Date;
  organizationId: string;
  trainerId: string | null;
  riderId: string | null;
  trainer?: Trainer | null;
  rider?: Rider | null;
  board?: Board | null;
}

export interface Service {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  organizationId: string;
  isRestricted: boolean;
  description: string | null;
  canRiderAdd: boolean;
  price: number;
  creditPrice: number;
  creditAdditionalPrice: number | null;
  maxRiders: number;
  isPrivate: boolean;
  canRecurBook: boolean;
  restrictedToLevelId: string | null;
  isAllTrainers: boolean;
  isActive: boolean;
  boardAssignments?: ServiceBoardAssignment[] | null;
  trainerAssignments?: ServiceTrainerAssignment[] | null;
  restrictedToLevel?: Level | null;
}

export interface ServiceTrainerAssignment {
  organizationId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  serviceId: string;
  trainerId: string;
  service?: Service | null;
  trainer?: Trainer | null;
}

export interface ServiceBoardAssignment {
  organizationId: string;
  id: string;
  createdAt: Date;
  boardId: string;
  isActive: boolean;
  serviceId: string;
  service?: Service | null;
  board?: Board | null;
}
