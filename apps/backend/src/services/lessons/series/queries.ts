import type { ListLessonSeriesResponse } from "@instride/api/contracts";
import type { GetLessonSeriesResponse } from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { toLessonSeries } from "../mappers";
import { lessonSeriesService } from "./series.service";

export const listLessonSeries = api(
  { expose: true, method: "GET", path: "/lessons/series", auth: true },
  async (): Promise<ListLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const rows = await lessonSeriesService.findManyFull(organizationId);
    return { series: rows.map(toLessonSeries) };
  }
);

export const getLessonSeries = api(
  { expose: true, method: "GET", path: "/lessons/series/:id", auth: true },
  async ({ id }: { id: string }): Promise<GetLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const series = await lessonSeriesService.findOneFull(id, organizationId);

    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
      columns: { timezone: true },
    });
    assertExists(organization?.timezone, "Organization timezone not found");

    return {
      series: toLessonSeries(series),
      timezone: organization.timezone,
    };
  }
);
