# SECURITY.md

`ssot-goal-lab`의 인증·인가·비밀 관리 및 Supabase RLS 정책의 SSOT다.

## 1. 인증 (Supabase Auth)
- 이메일/비밀번호 기반 Supabase Auth.
- 세션은 `@supabase/ssr` 쿠키로 관리하고, `src/middleware.ts`(updateSession)가 매 요청 세션을 갱신한다.
- 보호 경로(`/goals`)는 미들웨어 + 페이지에서 세션을 확인하고, 미인증 시 `/login`으로 리다이렉트한다.

## 2. 키 / 비밀 관리
| 키 | 위치 | 노출 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client/server | 공개 가능 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server | 공개 가능 (RLS로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** | 절대 노출 금지 |

- 클라이언트(Client Component)는 anon key만 사용한다.
- service role key는 `src/lib/supabase/admin.ts`에서만 쓰며, 해당 모듈은 `import "server-only"`로 보호되어 클라이언트 번들 포함 시 빌드가 실패한다.
- secret은 `.env.local`/Vercel 환경변수로 주입하고 커밋하지 않는다(`.env*` gitignore). 예시는 `.env.example`.

## 3. RLS 정책 (모든 테이블 enable)

### profiles (본인 행만)
```sql
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
```

### goals (본인 행만 CRUD)
```sql
alter table public.goals enable row level security;
create policy "goals_select_own" on public.goals for select to authenticated using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert to authenticated with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete to authenticated using (auth.uid() = user_id);
```

## 4. 다층 방어
- RLS가 1차 경계다. 추가로 server action에서 `.eq("user_id", userId)`로 이중 제약한다.
- 모든 server action 입력은 zod 스키마(`src/features/goals/schema.ts`, auth는 `actions.ts` 내 스키마)로 검증한다.

## 5. 금지 사항
- service role key를 클라이언트/로그/문서에 노출 금지.
- RLS 비활성화 또는 사용자 소유 테이블에 `using (true)` 금지.
- CI 통과를 위한 lint/typecheck/test/build/guardrails 비활성화 금지.
