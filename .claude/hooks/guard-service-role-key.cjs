#!/usr/bin/env node
/**
 * PreToolUse(Write|Edit) guard.
 * CLAUDE.md / docs/SECURITY.md 규칙 강제:
 *   "Supabase service role key를 클라이언트 코드에 노출하지 마라."
 *   "서버 전용 secret은 Client Component에서 import하면 안 된다."
 *
 * Client Component(=`'use client'` 지시문 보유, 또는 components 디렉터리)
 * 에 SUPABASE_SERVICE_ROLE_KEY 또는 server-only admin client import가
 * 들어오면 차단(deny)한다. 서버 전용 파일(route handler, src/lib/supabase/admin)은
 * 정당하게 service role을 쓸 수 있으므로 막지 않는다.
 */
const fs = require("fs");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function allow() {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
      },
    })
  );
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  allow(); // 파싱 실패 시 가드는 통과시키되 다른 검증에 맡긴다.
}

const input = payload.tool_input || {};
const filePath = String(input.file_path || "");
// Write -> content, Edit -> new_string, Edit(replace_all 포함) 동일
const content = String(input.content || input.new_string || "");

const SECRET = /SUPABASE_SERVICE_ROLE_KEY/;
const ADMIN_IMPORT = /supabase\/admin/;

const isClientComponent =
  /(^|\n)\s*['"]use client['"]/.test(content) ||
  /\/src\/features\/[^/]+\/components\//.test(filePath);

const touchesServerSecret = SECRET.test(content) || ADMIN_IMPORT.test(content);

if (isClientComponent && touchesServerSecret) {
  deny(
    "보안 위반(docs/SECURITY.md): Client Component에 SUPABASE_SERVICE_ROLE_KEY / server-only admin client가 포함됩니다. " +
      "service role은 서버 전용 모듈(src/lib/supabase/admin.ts, route handler)에서만 사용하고, " +
      "클라이언트에서는 NEXT_PUBLIC_SUPABASE_ANON_KEY만 사용하세요."
  );
}

allow();
