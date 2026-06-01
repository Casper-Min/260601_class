import { GoalItem } from "./GoalItem";
import type { Goal } from "../types";

export function GoalList({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <p className="empty" data-testid="goals-empty">
        아직 목표가 없습니다. 위에서 첫 목표를 추가해보세요.
      </p>
    );
  }
  return (
    <ul className="goal-list" data-testid="goal-list">
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} />
      ))}
    </ul>
  );
}
