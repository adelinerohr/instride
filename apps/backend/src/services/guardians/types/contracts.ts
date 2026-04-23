import { GuardianPermissions } from "@instride/shared/models/types";

export interface MyDependent {
  id: string;
  dependentMemberId: string;
  permissions: GuardianPermissions;
  createdAt: Date;
  dependent: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
    dateOfBirth: string | null;
    image: string | null;
    riderId: string;
    isRestricted: boolean;
    ridingLevelId: string | null;
    level: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      organizationId: string;
      description: string | null;
      color: string;
    } | null;
    boardAssignments: string[];
  };
}
