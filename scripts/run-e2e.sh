#!/usr/bin/env bash
# Playwright e2e 실행 헬퍼.
# 이 환경엔 chromium OS 의존 패키지가 root 없이 설치 불가하여,
# .vendor/ 에 추출한 라이브러리를 LD_LIBRARY_PATH로 연결한다.
# (CI/정상 환경에서는 `npx playwright install --with-deps chromium` 사용 권장)
set -euo pipefail
cd "$(dirname "$0")/.."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20 >/dev/null 2>&1 || true

if [ -f .vendor/libpath.txt ]; then
  export LD_LIBRARY_PATH="$(cat .vendor/libpath.txt)${LD_LIBRARY_PATH:-}"
fi

exec npx playwright test "$@"
