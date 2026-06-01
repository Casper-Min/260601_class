#!/usr/bin/env bash
# 실 Supabase 키가 .env.local 에 채워진 뒤 실행하면:
#   1) Vercel production env를 실 값으로 교체
#   2) 재배포
#   3) 확정된 테스트 계정 시드
#   4) 배포 URL 대상 전체 CRUD e2e 실행
# 선행: Supabase 대시보드 SQL Editor에서 supabase/schema.sql 적용.
set -euo pipefail
cd "$(dirname "$0")/.."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20 >/dev/null 2>&1 || true

# .env.local 로드
set -a; . ./.env.local; set +a
: "${NEXT_PUBLIC_SUPABASE_URL:?}"; : "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?}"; : "${SUPABASE_SERVICE_ROLE_KEY:?}"
E2E_EMAIL="${E2E_EMAIL:-e2e@example.com}"
E2E_PASSWORD="${E2E_PASSWORD:-Passw0rd!e2e}"
DEPLOY_URL="${DEPLOY_URL:-https://260601class.vercel.app}"

echo "==> Vercel env 교체 (production)"
for k in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  npx vercel env rm "$k" production -y >/dev/null 2>&1 || true
  printf '%s' "${!k}" | npx vercel env add "$k" production >/dev/null
  echo "   set $k"
done

echo "==> 재배포 (production)"
npx vercel deploy --prod --yes

echo "==> 테스트 계정 시드"
E2E_EMAIL="$E2E_EMAIL" E2E_PASSWORD="$E2E_PASSWORD" node scripts/seed-test-user.mjs

echo "==> 전체 CRUD e2e (배포 URL: $DEPLOY_URL)"
[ -f .vendor/libpath.txt ] && export LD_LIBRARY_PATH="$(cat .vendor/libpath.txt)${LD_LIBRARY_PATH:-}"
E2E_SUPABASE=1 E2E_EMAIL="$E2E_EMAIL" E2E_PASSWORD="$E2E_PASSWORD" E2E_BASE_URL="$DEPLOY_URL" npx playwright test

echo "==> 완료"
