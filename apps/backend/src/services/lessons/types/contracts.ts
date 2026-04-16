import {
  LessonInstanceEnrollment,
  LessonSeries,
  LessonSeriesEnrollment,
  LessonInstance,
} from "./models";

export interface ListLessonSeriesResponse {
  series: LessonSeries[];
}

export interface GetLessonSeriesResponse extends LessonSeries {
  timezone?: string;
}

export interface ListLessonInstancesResponse {
  instances: LessonInstance[];
}

export interface GetLessonInstanceResponse {
  instance: LessonInstance;
}

export interface ListLessonSeriesEnrollmentsResponse {
  enrollments: LessonSeriesEnrollment[];
}

export interface ListLessonInstanceEnrollmentsResponse {
  enrollments: LessonInstanceEnrollment[];
}

export interface GetInstanceEnrollmentResponse {
  enrollment: LessonInstanceEnrollment;
}
