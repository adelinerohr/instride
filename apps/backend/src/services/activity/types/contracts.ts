import { Activity } from "./models";

export interface GetActivityResponse {
  activity: Activity;
}

export interface ListActivityResponse {
  activities: Activity[];
}
