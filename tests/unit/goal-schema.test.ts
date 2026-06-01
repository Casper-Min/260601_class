import { describe, it, expect } from "vitest";
import {
  goalCreateSchema,
  goalUpdateSchema,
} from "@/features/goals/schema";

describe("goalCreateSchema", () => {
  it("유효한 입력을 통과시킨다", () => {
    const r = goalCreateSchema.safeParse({ title: "운동하기", description: "" });
    expect(r.success).toBe(true);
  });

  it("빈 제목을 거부한다", () => {
    const r = goalCreateSchema.safeParse({ title: "   ", description: "" });
    expect(r.success).toBe(false);
  });

  it("200자를 초과하는 제목을 거부한다", () => {
    const r = goalCreateSchema.safeParse({ title: "a".repeat(201) });
    expect(r.success).toBe(false);
  });
});

describe("goalUpdateSchema", () => {
  it("잘못된 status를 거부한다", () => {
    const r = goalUpdateSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      title: "x",
      description: "",
      status: "nope",
    });
    expect(r.success).toBe(false);
  });

  it("유효한 update 입력을 통과시킨다", () => {
    const r = goalUpdateSchema.safeParse({
      id: "11111111-1111-4111-8111-111111111111",
      title: "x",
      description: "설명",
      status: "done",
    });
    expect(r.success).toBe(true);
  });
});
