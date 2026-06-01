# DECISIONS.md

아키텍처/제품 결정 기록 (SSOT). 결정이 바뀌면 여기에 추가한다.

## 2026-06-01

- **프로젝트 방향: `ssot-goal-lab`(목표 관리 앱)으로 통일.** 초기 문서에 반도체 밸류에이션 안이 섞여 있었으나, 사용자 결정으로 목표 관리 앱으로 확정. 관련 문서(PRODUCT_SPEC/SECURITY)를 goal-lab 기준으로 재작성. 반도체 전용 문서(QUALITY_SCORE)는 제거.
- **저장소 구조: 단일 루트로 평탄화.** 하위 `lecture-lab/ssot-goal-lab` 앱을 저장소 루트로 이동, SSOT 문서·`.claude` 설정과 한 곳에서 관리.
- **Node ≥ 20.12 고정(`.nvmrc`, engines).** vitest 4(rolldown)가 `node:util.styleText`를 요구하여 Node 18 불가.
- **`npm run verify` = lint → typecheck → test(vitest) → build.** 작업 완료의 기계적 기준.
- **service role key 보호: `import "server-only"` + PreToolUse 가드 hook + RLS.** 3중으로 클라이언트 노출 차단.
- **e2e: Playwright.** 라우팅/인증 게이트는 백엔드 없이 검증, 전체 CRUD는 실 Supabase 자격증명 게이트(`E2E_SUPABASE=1`).
- **이 환경 한정: chromium OS 의존 라이브러리를 root 없이 `.vendor/`로 추출해 `LD_LIBRARY_PATH` 연결.** 정상 환경은 `playwright install --with-deps` 사용.
