import { test, expect } from "@playwright/test";

// 로그인 + 목표 CRUD 전체 플로우 e2e.
// 실제 Supabase 자격증명이 필요하므로 기본은 skip. 실행하려면:
//   E2E_SUPABASE=1 와 .env.local 의 진짜 Supabase 값 + 테스트 계정(E2E_EMAIL/E2E_PASSWORD)
const RUN = process.env.E2E_SUPABASE === "1";
const EMAIL = process.env.E2E_EMAIL ?? "";
const PASSWORD = process.env.E2E_PASSWORD ?? "";

test.describe("목표 CRUD (실 Supabase 필요)", () => {
  test.skip(!RUN, "E2E_SUPABASE=1 및 실제 Supabase 자격증명 필요");

  test("로그인 후 목표를 추가하고 삭제한다", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("이메일").fill(EMAIL);
    await page.getByLabel("비밀번호").fill(PASSWORD);
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL(/\/goals/);

    const title = `e2e 목표 ${Date.now()}`;
    await page.getByLabel("목표 제목").fill(title);
    await page.getByRole("button", { name: "목표 추가" }).click();

    await expect(page.getByText(title)).toBeVisible();

    // 방금 추가한 목표 삭제
    const item = page.getByTestId("goal-item").filter({ hasText: title });
    await item.getByRole("button", { name: "목표 삭제" }).click();
    await expect(page.getByText(title)).toHaveCount(0);
  });
});
