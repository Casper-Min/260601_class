import Link from "next/link";
import { getCurrentUser } from "@/features/goals/queries";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="container">
      <h1>ssot-goal-lab</h1>
      <p>사용자가 스스로 정한 목표를 만들고 관리하는 앱입니다.</p>
      <nav className="home-nav">
        {user ? (
          <Link href="/goals" data-testid="cta-goals">
            내 목표 보기
          </Link>
        ) : (
          <Link href="/login" data-testid="cta-login">
            시작하기 (로그인)
          </Link>
        )}
      </nav>
    </main>
  );
}
