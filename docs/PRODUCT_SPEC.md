# PRODUCT_SPEC.md

## 1. 개요
사용자가 스스로 정한 **목표(goal)** 를 만들고 관리하는 웹 앱이다. 로그인한 사용자는 자신의 목표만 생성·수정·삭제·조회할 수 있다.

- 프로젝트 코드명: `ssot-goal-lab`
- 기술 스택: Next.js App Router, TypeScript, Supabase (Auth / Postgres / RLS), Vercel
- SSOT: 이 저장소의 파일 (대화 내용은 진실의 출처가 아니다)

## 2. 목표 사용자
- 개인 목표를 가볍게 기록·관리하고 싶은 사용자

## 3. 범위 (In Scope)
- Supabase Auth 이메일/비밀번호 로그인·회원가입·로그아웃
- 로그인 사용자의 목표 CRUD (제목, 설명, 상태)
- 본인 데이터만 접근 (RLS로 강제)

## 4. 비범위 (Out of Scope)
- 팀 협업/공유, 분석/통계, 이메일 알림 템플릿 (sprint-01 기준)

## 5. 데이터 모델
| 테이블 | 설명 | 접근 |
| --- | --- | --- |
| `profiles` | auth.users 1:1 프로필 | 본인 행만 (RLS) |
| `goals` | 사용자별 목표 (title, description, status) | 본인 행만 CRUD (RLS) |

세부 스키마·RLS는 [SECURITY.md](./SECURITY.md), `supabase/schema.sql` 참조.

## 6. 라우트 (Next.js App Router)
- `/` — 랜딩 (로그인 상태에 따라 CTA 분기)
- `/login` — Supabase Auth 로그인/회원가입
- `/goals` — 로그인 사용자의 목표 목록 + 추가/수정/삭제 (인증 필요, 미인증 시 `/login` 리다이렉트)

## 7. 책임 경계 (코드)
- UI: `src/app/*`, `src/features/*/components/*`
- Server actions/queries: `src/features/goals/{actions,queries}.ts`, `src/features/auth/actions.ts`
- Supabase client: `src/lib/supabase/{client,server,admin,middleware}.ts`
- 세션 게이트: `src/middleware.ts`

## 8. 완료 기준 (sprint-01)
[docs/sprint-contracts/sprint-01.md](./sprint-contracts/sprint-01.md) 참조. 요지: 로그인 가능, `goals` 테이블 + RLS, 본인 데이터만 접근, `npm run verify` 통과.

## 9. 검증
- 단위: zod 입력 스키마 (`tests/unit`)
- e2e: Playwright (`tests/e2e`) — 라우팅/인증 게이트는 오프라인 통과, 전체 CRUD는 실 Supabase 자격증명 필요.
