import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// E2E_BASE_URL 가 있으면 배포된 URL 대상으로 실행(웹서버 미기동), 없으면 로컬 빌드.
const EXTERNAL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: EXTERNAL ?? `http://localhost:${PORT}`,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(EXTERNAL
    ? {}
    : {
        webServer: {
          // 빌드 후 production 서버로 e2e 실행 (자체 포함).
          command: `npm run build && npm run start -- -p ${PORT}`,
          url: `http://localhost:${PORT}`,
          timeout: 180_000,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
