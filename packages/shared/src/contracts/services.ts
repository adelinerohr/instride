import {
  Service,
  ServiceBoardAssignment,
  ServiceTrainerAssignment,
  ServiceWithAssignments,
} from "../interfaces/services";

export interface CreateServiceRequest {
  name: string;
  duration: number;
  description: string | null;
  price: number;
  creditPrice: number;
  creditAdditionalPrice: number | null;
  maxRiders: number;
  isPrivate: boolean;
  canRecurBook: boolean;
  isRestricted: boolean;
  restrictedToLevelId: string | null;
}

export interface UpdateServiceRequest extends CreateServiceRequest {}

export interface CreateServiceResponse {
  service: Service;
}

export interface GetServicesResponse {
  services: ServiceWithAssignments[];
}

export interface GetTrainerServicesResponse {
  services: Service[];
}

export interface GetBoardServicesResponse {
  services: Service[];
}

export interface GetServiceResponse {
  service: ServiceWithAssignments;
}

export interface UpdateServiceResponse {
  service: Service;
}

export interface GetTrainerServiceAssignmentsResponse {
  assignments: ServiceTrainerAssignment[];
}

export interface GetBoardServiceAssignmentsResponse {
  assignments: ServiceBoardAssignment[];
}
