import {
  LessonInstanceCreatedEvent,
  RiderEnrolledInInstanceEvent,
} from "@instride/shared";
import { Topic } from "encore.dev/pubsub";

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
