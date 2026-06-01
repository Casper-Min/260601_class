"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initial: AuthState = {};

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState(signIn, initial);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initial);
  const error = signInState.error ?? signUpState.error;

  return (
    <form className="login-form" aria-label="로그인">
      <input
        type="email"
        name="email"
        placeholder="이메일"
        required
        aria-label="이메일"
      />
      <input
        type="password"
        name="password"
        placeholder="비밀번호 (6자 이상)"
        required
        minLength={6}
        aria-label="비밀번호"
      />
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
      <div className="login-actions">
        <button type="submit" formAction={signInAction} disabled={signingIn || signingUp}>
          {signingIn ? "로그인 중..." : "로그인"}
        </button>
        <button type="submit" formAction={signUpAction} disabled={signingIn || signingUp}>
          {signingUp ? "가입 중..." : "회원가입"}
        </button>
      </div>
    </form>
  );
}
