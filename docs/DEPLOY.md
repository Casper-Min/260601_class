# DEPLOY.md

배포 및 전체 e2e를 마치기 위한 절차. 자격증명이 필요한 단계는 **사람만** 수행할 수 있다.

## 1. Supabase 준비 (런타임 + 전체 e2e에 필요)
1. Supabase 프로젝트 생성 → SQL Editor에서 `supabase/schema.sql` 실행(테이블·RLS·트리거).
2. `.env.local`에 실제 값 입력 (`.env.example` 참고):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. 전체 CRUD e2e 실행:
   ```
   E2E_SUPABASE=1 E2E_EMAIL=<테스트계정> E2E_PASSWORD=<비번> ./scripts/run-e2e.sh
   ```

## 2. Vercel 배포 (둘 중 택1)
### A) Git 연동(권장)
1. Vercel 대시보드에서 GitHub 저장소 `Casper-Min/260601_class` import.
2. Environment Variables에 위 3개 Supabase 값 등록.
3. 브랜치 푸시 시 자동 빌드/배포 (`vercel.json`의 `framework: nextjs`).

### B) CLI
세션 입력창에서 `!` 접두사로 대화형 로그인 후 배포:
```
! npx vercel login
! npx vercel link
! npx vercel env add NEXT_PUBLIC_SUPABASE_URL
! npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
! npx vercel env add SUPABASE_SERVICE_ROLE_KEY
! npx vercel --prod
```
또는 `VERCEL_TOKEN`을 발급해 `vercel --prod --token $VERCEL_TOKEN`.

## 참고
- 로컬 품질 게이트: `npm run verify` (Node ≥ 20.12, `.nvmrc=20`).
- 이 개발 환경에선 chromium OS 라이브러리를 root 없이 `.vendor/`로 추출해 e2e를 돌린다. 정상 환경은 `npx playwright install --with-deps chromium`.
