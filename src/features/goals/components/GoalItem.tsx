"use client";

import { useActionState } from "react";
import { updateGoal, deleteGoal, type ActionState } from "../actions";
import { GOAL_STATUSES } from "../schema";
import type { Goal } from "../types";

const initial: ActionState = {};

const STATUS_LABEL: Record<string, string> = {
  active: "진행 중",
  done: "완료",
  archived: "보관",
};

export function GoalItem({ goal }: { goal: Goal }) {
  const [updateState, updateAction, updating] = useActionState(updateGoal, initial);
  const [deleteState, deleteAction, deleting] = useActionState(deleteGoal, initial);

  return (
    <li className="goal-item" data-testid="goal-item">
      <form action={updateAction} className="goal-edit">
        <input type="hidden" name="id" value={goal.id} />
        <input
          type="text"
          name="title"
          defaultValue={goal.title}
          required
          maxLength={200}
          aria-label="목표 제목 수정"
        />
        <textarea
          name="description"
          defaultValue={goal.description ?? ""}
          maxLength={2000}
          aria-label="목표 설명 수정"
        />
        <select name="status" defaultValue={goal.status} aria-label="상태">
          {GOAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={updating}>
          {updating ? "저장 중..." : "저장"}
        </button>
      </form>

      <form action={deleteAction} className="goal-delete">
        <input type="hidden" name="id" value={goal.id} />
        <button type="submit" disabled={deleting} aria-label="목표 삭제">
          {deleting ? "삭제 중..." : "삭제"}
        </button>
      </form>

      {updateState.error ? <p role="alert" className="error">{updateState.error}</p> : null}
      {deleteState.error ? <p role="alert" className="error">{deleteState.error}</p> : null}
    </li>
  );
}
