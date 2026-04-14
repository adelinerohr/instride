import { Topic } from "encore.dev/pubsub";

import {
  LessonInstanceCreatedEvent,
  RiderEnrolledInInstanceEvent,
} from "./types/events";

export const lessonCreated = new Topic<LessonInstanceCreatedEvent>(
  "lesson-created",
  {
    deliveryGuarantee: "at-least-once",
  }
);

export const lessonEnrolled = new Topic<RiderEnrolledInInstanceEvent>(
  "lesson-enrolled",
  {
    deliveryGuarantee: "at-least-once",
  }
);
