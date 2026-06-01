import { LoginForm } from "@/features/auth/LoginForm";

export const metadata = { title: "로그인 — ssot-goal-lab" };

export default function LoginPage() {
  return (
    <main className="container">
      <h1>로그인</h1>
      <p>이메일과 비밀번호로 로그인하거나 새 계정을 만드세요.</p>
      <LoginForm />
    </main>
  );
}
