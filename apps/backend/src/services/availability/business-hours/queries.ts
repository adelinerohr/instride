import { api } from "encore.dev/api";

import { db } from "@/database";
import { assertAdminOrSelf } from "@/services/auth/gates";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  ListOrganizationBusinessHoursResponse,
  ListTrainerBusinessHoursResponse,
} from "../types/contracts";
import { getBusinessHours } from "./repository";

export const listOrganizationBusinessHours = api(
  {
    method: "GET",
    path: "/business-hours/organization",
    expose: true,
    auth: true,
  },
  async (): Promise<ListOrganizationBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();
    return await getBusinessHours({
      type: "organization",
      client: db,
      organizationId,
    });
  }
);

export const listTrainerBusinessHours = api(
  {
    method: "GET",
    path: "/business-hours/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async (params: {
    trainerId: string;
  }): Promise<ListTrainerBusinessHoursResponse> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdminOrSelf(organizationId, userID, params.trainerId);

    return await getBusinessHours({
      type: "trainer",
      client: db,
      organizationId,
      trainerId: params.trainerId,
    });
  }
);
