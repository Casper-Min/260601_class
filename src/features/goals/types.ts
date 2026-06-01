import type { GoalStatus } from "./schema";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}
