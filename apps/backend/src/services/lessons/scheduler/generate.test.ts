import { LessonSeriesEnrollmentStatus } from "@instride/shared/models/enums";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({
  api: (_options: unknown, handler: unknown) => handler,
}));

vi.mock("@instride/shared", () => {
  const addDaysToYmd = (input: {
    year: number;
    month: number;
    day: number;
    daysToAdd: number;
  }) => {
    const base = new Date(Date.UTC(input.year, input.month - 1, input.day));
    base.setUTCDate(base.getUTCDate() + input.daysToAdd);
    return {
      year: base.getUTCFullYear(),
      month: base.getUTCMonth() + 1,
      day: base.getUTCDate(),
    };
  };

  return {
    addDaysToYmd,
    getDOWInTimeZone: (input: { date: Date }) => input.date.getUTCDay(),
    getLocalParts: (input: { date: Date }) => {
      // In real usage, `getLocalParts` is used both for building the date cursor
      // (needs YMD) and for extracting a template start time (should not override YMD).
      // We emulate that behavior by returning time-only for the series start used in tests.
      if (input.date.toISOString() === "2026-04-08T10:00:00.000Z") {
        return { hour: 10, minute: 0 };
      }

      return {
        year: input.date.getUTCFullYear(),
        month: input.date.getUTCMonth() + 1,
        day: input.date.getUTCDate(),
        hour: input.date.getUTCHours(),
        minute: input.date.getUTCMinutes(),
      };
    },
    makeUTCDateFromLocalParts: (input: {
      parts: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second?: number;
      };
    }) =>
      new Date(
        Date.UTC(
          input.parts.year,
          input.parts.month - 1,
          input.parts.day,
          input.parts.hour,
          input.parts.minute,
          input.parts.second ?? 0
        )
      ),
  };
});

const mockGetLessonSeries = vi.fn();
const mockGenerateRecurringInstances = vi.fn();
const mockGenerateStandaloneInstance = vi.fn();
const mockEnrollInInstance = vi.fn();
const mockCreateLessonInstance = vi.fn();
const mockCheckLessonAvailability = vi.fn();

const mockFindMany = vi.fn();
const mockFindFirstInstance = vi.fn();
const mockUpdateWhere = vi.fn();
const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });

// Break potential circular schema dependency in tests.
vi.mock("../schema", () => ({
  lessonSeries: {},
}));

vi.mock("../series/get", () => ({
  getLessonSeries: (...args: unknown[]) => mockGetLessonSeries(...args),
}));

vi.mock("./utils", () => ({
  generateRecurringInstances: (...args: unknown[]) =>
    mockGenerateRecurringInstances(...args),
  generateStandaloneInstance: (...args: unknown[]) =>
    mockGenerateStandaloneInstance(...args),
}));

vi.mock("../enrollments/post", () => ({
  enrollInInstance: (...args: unknown[]) => mockEnrollInInstance(...args),
}));

vi.mock("../instances/post", () => ({
  createLessonInstance: (...args: unknown[]) =>
    mockCreateLessonInstance(...args),
}));

vi.mock("../utils/availability", () => ({
  checkLessonAvailability: (...args: unknown[]) =>
    mockCheckLessonAvailability(...args),
}));

vi.mock("../db", () => ({
  db: {
    query: {
      lessonInstances: {
        findFirst: (...args: unknown[]) => mockFindFirstInstance(...args),
      },
      lessonSeriesEnrollments: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
      },
    },
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

import { generateLessonInstances } from "./generate";

describe("generateLessonInstances", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetLessonSeries.mockResolvedValue({
      id: "series-123",
      isRecurring: false,
      timezone: "America/Chicago",
    });

    mockGenerateRecurringInstances.mockResolvedValue({
      instances: [],
      skipped: [],
    });

    mockGenerateStandaloneInstance.mockResolvedValue({
      instances: [],
      skipped: [],
    });

    mockFindMany.mockResolvedValue([]);
    mockFindFirstInstance.mockResolvedValue(null);
    mockCreateLessonInstance.mockResolvedValue({
      instance: { id: "instance-1" },
    });
    mockCheckLessonAvailability.mockResolvedValue([]);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  it("throws when the lesson series timezone is missing", async () => {
    mockGetLessonSeries.mockResolvedValue({
      id: "series-123",
      isRecurring: false,
      timezone: null,
    });

    await expect(
      generateLessonInstances({
        seriesId: "series-123",
        until: new Date("2026-05-01T00:00:00.000Z"),
      })
    ).rejects.toThrow("Lesson series timezone not found");
  });

  it("generates recurring instances when the series is recurring", async () => {
    const until = new Date("2026-05-01T00:00:00.000Z");
    mockGetLessonSeries.mockResolvedValue({
      id: "series-123",
      isRecurring: true,
      timezone: "America/Chicago",
    });

    mockGenerateRecurringInstances.mockResolvedValue({
      instances: [{ id: "instance-1" }, { id: "instance-2" }],
      skipped: [{ date: "2026-04-24", reason: "conflict" }],
    });

    const result = await generateLessonInstances({
      seriesId: "series-123",
      until,
    });

    expect(mockGenerateRecurringInstances).toHaveBeenCalledTimes(1);
    expect(mockGenerateStandaloneInstance).not.toHaveBeenCalled();
    expect(mockGenerateRecurringInstances.mock.calls[0]?.[0]).toMatchObject({
      series: { id: "series-123" },
      timezone: "America/Chicago",
      until,
    });

    expect(result).toEqual({
      created: 2,
      skipped: [{ date: "2026-04-24", reason: "conflict" }],
    });
  });

  it("generates a standalone instance when the series is not recurring", async () => {
    mockGetLessonSeries.mockResolvedValue({
      id: "series-123",
      isRecurring: false,
      timezone: "America/Chicago",
    });

    mockGenerateStandaloneInstance.mockResolvedValue({
      instances: [{ id: "instance-1" }],
      skipped: [],
    });

    const result = await generateLessonInstances({
      seriesId: "series-123",
      until: new Date("2026-05-01T00:00:00.000Z"),
    });

    expect(mockGenerateStandaloneInstance).toHaveBeenCalledTimes(1);
    expect(mockGenerateRecurringInstances).not.toHaveBeenCalled();
    expect(mockGenerateStandaloneInstance.mock.calls[0]?.[0]).toMatchObject({
      series: { id: "series-123" },
      timezone: "America/Chicago",
    });

    expect(result).toEqual({ created: 1, skipped: [] });
  });

  it("enrolls active riders into each generated instance", async () => {
    mockGenerateStandaloneInstance.mockResolvedValue({
      instances: [{ id: "instance-1" }, { id: "instance-2" }],
      skipped: [],
    });

    mockFindMany.mockResolvedValue([
      {
        seriesId: "series-123",
        status: LessonSeriesEnrollmentStatus.ACTIVE,
        riderId: "rider-1",
      },
      {
        seriesId: "series-123",
        status: LessonSeriesEnrollmentStatus.ACTIVE,
        riderId: "rider-2",
      },
    ]);

    await generateLessonInstances({
      seriesId: "series-123",
      until: new Date("2026-05-01T00:00:00.000Z"),
    });

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockEnrollInInstance).toHaveBeenCalledTimes(2);
    expect(mockEnrollInInstance).toHaveBeenNthCalledWith(1, {
      instanceId: "instance-1",
      riderIds: ["rider-1", "rider-2"],
    });
    expect(mockEnrollInInstance).toHaveBeenNthCalledWith(2, {
      instanceId: "instance-2",
      riderIds: ["rider-1", "rider-2"],
    });
  });

  it("does not enroll riders when there are no active enrollments", async () => {
    mockGenerateStandaloneInstance.mockResolvedValue({
      instances: [{ id: "instance-1" }, { id: "instance-2" }],
      skipped: [],
    });
    mockFindMany.mockResolvedValue([]);

    await generateLessonInstances({
      seriesId: "series-123",
      until: new Date("2026-05-01T00:00:00.000Z"),
    });

    expect(mockEnrollInInstance).not.toHaveBeenCalled();
  });

  it("updates series lastPlannedUntil to request.until", async () => {
    const until = new Date("2026-05-01T00:00:00.000Z");

    await generateLessonInstances({
      seriesId: "series-123",
      until,
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdateSet).toHaveBeenCalledTimes(1);
    expect(mockUpdateSet).toHaveBeenCalledWith({ lastPlannedUntil: until });
    expect(mockUpdateWhere).toHaveBeenCalledTimes(1);
  });
});

describe("scheduler utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirstInstance.mockResolvedValue(null);
    mockCheckLessonAvailability.mockResolvedValue([]);
  });

  it("generateStandaloneInstance creates a single instance with a stable occurrenceKey", async () => {
    const { generateStandaloneInstance } =
      await vi.importActual<typeof import("./utils")>("./utils");

    mockCreateLessonInstance.mockResolvedValueOnce({
      instance: { id: "instance-standalone" },
    });

    const seriesStart = new Date("2026-05-01T10:00:00.000Z");
    const series = {
      id: "series-123",
      organizationId: "org-1",
      boardId: "board-1",
      trainerId: "trainer-1",
      serviceId: "service-1",
      levelId: null,
      name: null,
      notes: null,
      maxRiders: 10,
      duration: 60,
      start: seriesStart,
    } as const;

    const result = await generateStandaloneInstance({
      // Type cast keeps the test focused on behavior, not model shape.
      series: series as unknown as import("../types/models").LessonSeries,
      timezone: "UTC",
    });

    expect(result).toEqual({
      instances: [{ id: "instance-standalone" }],
      skipped: [],
    });

    expect(mockCreateLessonInstance).toHaveBeenCalledTimes(1);
    expect(mockCreateLessonInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        seriesId: "series-123",
        occurrenceKey: "standalone:series-123",
        start: seriesStart.toISOString(),
        end: new Date(seriesStart.getTime() + 60 * 60 * 1000).toISOString(),
      })
    );
  });

  it("generateRecurringInstances materializes weekly occurrences until the effective until date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));

    const { generateRecurringInstances } =
      await vi.importActual<typeof import("./utils")>("./utils");

    let created = 0;
    mockCreateLessonInstance.mockImplementation(async () => {
      created += 1;
      return { instance: { id: `created-${created}` } };
    });

    const series = {
      id: "series-123",
      organizationId: "org-1",
      boardId: "board-1",
      trainerId: "trainer-1",
      serviceId: "service-1",
      levelId: null,
      name: null,
      notes: null,
      maxRiders: 10,
      duration: 60,
      start: new Date("2026-04-08T10:00:00.000Z"),
      lastPlannedUntil: new Date("2026-04-07T09:00:00.000Z"),
      recurrenceEnd: null,
    } as const;

    const result = await generateRecurringInstances({
      series: series as unknown as import("../types/models").LessonSeries,
      timezone: "UTC",
      until: new Date("2026-04-29T00:00:00.000Z"),
    });

    expect(result.skipped).toEqual([]);
    expect(result.instances).toHaveLength(3); // 4/08, 4/15, 4/22
    expect(mockCreateLessonInstance).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });

  it("generateRecurringInstances skips occurrences that already exist", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));

    const { generateRecurringInstances } =
      await vi.importActual<typeof import("./utils")>("./utils");

    mockFindFirstInstance.mockImplementation(async (args: unknown) => {
      const occurrenceKey = (args as { where?: { occurrenceKey?: string } })
        ?.where?.occurrenceKey;
      if (occurrenceKey === "series-123:2026-04-08") return { id: "existing" };
      return null;
    });

    const series = {
      id: "series-123",
      organizationId: "org-1",
      boardId: "board-1",
      trainerId: "trainer-1",
      serviceId: "service-1",
      levelId: null,
      name: null,
      notes: null,
      maxRiders: 10,
      duration: 60,
      start: new Date("2026-04-08T10:00:00.000Z"),
      lastPlannedUntil: new Date("2026-04-07T09:00:00.000Z"),
      recurrenceEnd: null,
    } as const;

    const result = await generateRecurringInstances({
      series: series as unknown as import("../types/models").LessonSeries,
      timezone: "UTC",
      until: new Date("2026-04-22T10:00:00.000Z"),
    });

    // 4/08 exists, but 4/15 and 4/22 should be created.
    expect(result.instances).toHaveLength(2);
    expect(mockCreateLessonInstance).toHaveBeenCalledTimes(2);
    expect(mockCheckLessonAvailability).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("generateRecurringInstances returns skipped entries when availability violations exist", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));

    const { generateRecurringInstances } =
      await vi.importActual<typeof import("./utils")>("./utils");

    mockCheckLessonAvailability.mockResolvedValueOnce([
      { message: "Trainer conflict" },
      { message: "Board conflict", eventTitle: "Existing Event" },
    ]);

    const series = {
      id: "series-123",
      organizationId: "org-1",
      boardId: "board-1",
      trainerId: "trainer-1",
      serviceId: "service-1",
      levelId: null,
      name: null,
      notes: null,
      maxRiders: 10,
      duration: 60,
      start: new Date("2026-04-08T10:00:00.000Z"),
      lastPlannedUntil: new Date("2026-04-07T09:00:00.000Z"),
      recurrenceEnd: null,
    } as const;

    const result = await generateRecurringInstances({
      series: series as unknown as import("../types/models").LessonSeries,
      timezone: "UTC",
      until: new Date("2026-04-08T10:00:00.000Z"),
    });

    expect(result.instances).toEqual([]);
    expect(result.skipped).toEqual([
      {
        date: "2026-04-08",
        reason: "Trainer conflict, Board conflict",
        eventTitle: "Existing Event",
      },
    ]);
    expect(mockCreateLessonInstance).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
