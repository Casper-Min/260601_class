import { z } from "zod";

export const GOAL_STATUSES = ["active", "done", "archived"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

// 사용자 입력 검증 스키마 (server action 진입점에서 사용).
export const goalCreateSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력하세요").max(200, "제목은 200자 이하"),
  description: z.string().trim().max(2000, "설명은 2000자 이하").optional().or(z.literal("")),
});

export const goalUpdateSchema = goalCreateSchema.extend({
  id: z.string().uuid(),
  status: z.enum(GOAL_STATUSES),
});

export const goalIdSchema = z.object({ id: z.string().uuid() });

export type GoalCreateInput = z.infer<typeof goalCreateSchema>;
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;
