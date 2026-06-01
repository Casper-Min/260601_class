import { test, expect } from "@playwright/test";

// 실제 Supabase 백엔드 없이도 동작하는 라우팅/SSR/인증 게이트 e2e.

test("랜딩 페이지가 렌더되고 로그인 CTA를 보여준다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ssot-goal-lab" })).toBeVisible();
  await expect(page.getByTestId("cta-login")).toBeVisible();
});

test("로그인 페이지가 이메일/비밀번호 폼을 렌더한다", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
  await expect(page.getByLabel("이메일")).toBeVisible();
  await expect(page.getByLabel("비밀번호")).toBeVisible();
});

test("랜딩에서 시작하기를 누르면 /login 으로 이동한다", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("cta-login").click();
  await expect(page).toHaveURL(/\/login/);
});

test("미인증 사용자가 /goals 접근 시 /login 으로 리다이렉트된다", async ({ page }) => {
  await page.goto("/goals");
  await expect(page).toHaveURL(/\/login/);
});
