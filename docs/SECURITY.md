# SECURITY.md

본 문서는 `semicap-valuation` 앱의 인증·인가·비밀 관리 규칙과 Supabase RLS 정책의 SSOT다.

## 1. 인증 (Supabase Auth)
- 사용자 인증은 **Supabase Auth**를 사용한다 (이메일/비밀번호 + 매직 링크 기준).
- 세션은 서버 측에서 `@supabase/ssr` 기반 쿠키로 관리한다.
- 보호 라우트(`/watchlist` 등)는 서버에서 세션을 검증하고, 미인증 시 `/login`으로 리다이렉트한다.

## 2. 키 / 비밀 관리
| 키 | 사용 위치 | 노출 가능 여부 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트/서버 | 공개 가능 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트/서버 | 공개 가능 (RLS로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** (cron/ingest) | 절대 노출 금지 |

규칙:
- 클라이언트 코드(Client Component)는 **anon key만** 사용한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 server-only 모듈(`src/lib/supabase/admin.ts`)에서만 import하며, Client Component에서 import 금지.
- 모든 secret은 Vercel 환경변수로 주입하고, 저장소에 커밋하지 않는다(`.env*`는 gitignore).

## 3. 권한 모델
- **공개 데이터**: `companies`, `daily_quotes`, `valuation_scores` → 익명 포함 누구나 **읽기 가능**, 쓰기는 서비스 롤만.
- **사용자 소유 데이터**: `watchlist_items`, `profiles` → 본인 행만 읽기/쓰기 가능.

## 4. RLS 정책 (Row Level Security)
모든 테이블에서 RLS를 **활성화(enable)** 한다. 정책 요지는 다음과 같다.

### 4.1 공개 읽기 전용 테이블 (`companies`, `daily_quotes`, `valuation_scores`)
```sql
alter table companies enable row level security;

create policy "public_read_companies"
on companies for select
to anon, authenticated
using (true);

-- INSERT/UPDATE/DELETE 정책 없음 → anon/authenticated는 쓰기 불가.
-- 쓰기는 service_role 키(RLS 우회)를 사용하는 ingest 잡만 수행.
```
(`daily_quotes`, `valuation_scores`도 동일 패턴: select만 허용)

### 4.2 사용자 소유 테이블 (`watchlist_items`)
```sql
alter table watchlist_items enable row level security;

create policy "watchlist_select_own"
on watchlist_items for select
to authenticated
using (auth.uid() = user_id);

create policy "watchlist_insert_own"
on watchlist_items for insert
to authenticated
with check (auth.uid() = user_id);

create policy "watchlist_update_own"
on watchlist_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "watchlist_delete_own"
on watchlist_items for delete
to authenticated
using (auth.uid() = user_id);
```

### 4.3 프로필 테이블 (`profiles`)
- `profiles.id`는 `auth.users.id`를 참조한다.
- 본인 행만 select/update 가능. insert는 트리거 또는 본인(`auth.uid() = id`)만 허용.

## 5. 가정 (Assumptions)
- `user_id` 컬럼은 `auth.users(id)`를 FK로 참조하며 NOT NULL이다.
- ingest/cron 잡은 신뢰된 서버 환경(Vercel Cron / 서버 라우트)에서만 service role 키로 실행된다.
- anon 키로는 RLS 정책을 통해서만 데이터에 접근 가능하므로, 정책이 곧 보안 경계다.

## 6. 금지 사항
- service role 키를 클라이언트 번들/로그/문서에 노출 금지.
- RLS를 끄거나 `using (true)`로 사용자 소유 테이블을 열어두지 말 것.
- 보안 검증을 통과시키기 위해 guardrails를 비활성화하지 말 것.

## 7. 입력 검증
- 모든 server action은 입력을 스키마(zod 등)로 검증한 뒤 DB에 반영한다.
- ticker 등 사용자 입력은 화이트리스트(`companies`에 존재하는 ticker)로 검증한다.
