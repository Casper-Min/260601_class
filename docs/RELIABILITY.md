# RELIABILITY.md

`ssot-goal-lab`의 신뢰성·품질 게이트 기준의 SSOT다.

## 1. 품질 게이트
- `npm run verify` = lint → typecheck(`tsc --noEmit`) → test(vitest) → build. 모두 통과해야 작업 완료로 본다.
- e2e: `npm run test:e2e`(Playwright). 라우팅/인증 게이트는 백엔드 없이 통과, 전체 CRUD는 실 Supabase 자격증명 필요.

## 2. 런타임 가용성
- 읽기/쓰기 모두 Supabase Postgres + Auth에 의존한다.
- 보호 경로는 미들웨어에서 세션을 확인하므로, 세션 만료 시 사용자 데이터가 노출되지 않고 `/login`으로 유도된다.

## 3. 데이터 무결성
- `goals` 입력은 zod + DB check 제약(title 1~200자, status enum)으로 이중 검증.
- `updated_at`는 트리거로 자동 갱신, 신규 가입 시 `profiles`는 트리거로 자동 생성.

## 4. 환경
- Node ≥ 20.12 (`.nvmrc`). 필수 환경변수는 `.env.example` 참조.

## 5. 관측성 (후속)
- 에러 로깅/모니터링(Sentry 등)은 sprint-03 이후 과제.
