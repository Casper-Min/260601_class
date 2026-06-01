import { redirect } from "next/navigation";
import { getGoals, getCurrentUser } from "@/features/goals/queries";
import { GoalForm } from "@/features/goals/components/GoalForm";
import { GoalList } from "@/features/goals/components/GoalList";
import { signOut } from "@/features/auth/actions";

export const metadata = { title: "내 목표 — ssot-goal-lab" };

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/goals");

  const goals = await getGoals();

  return (
    <main className="container">
      <header className="page-header">
        <h1>내 목표</h1>
        <form action={signOut}>
          <button type="submit">로그아웃</button>
        </form>
      </header>
      <p className="user-email">{user.email}</p>
      <GoalForm />
      <GoalList goals={goals} />
    </main>
  );
}
