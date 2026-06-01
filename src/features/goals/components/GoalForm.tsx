"use client";

import { useActionState } from "react";
import { createGoal, type ActionState } from "../actions";

const initial: ActionState = {};

export function GoalForm() {
  const [state, formAction, pending] = useActionState(createGoal, initial);

  return (
    <form action={formAction} className="goal-form" aria-label="새 목표 추가">
      <input
        type="text"
        name="title"
        placeholder="새 목표 제목"
        required
        maxLength={200}
        aria-label="목표 제목"
      />
      <textarea
        name="description"
        placeholder="설명 (선택)"
        maxLength={2000}
        aria-label="목표 설명"
      />
      {state.error ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "추가 중..." : "목표 추가"}
      </button>
    </form>
  );
}
