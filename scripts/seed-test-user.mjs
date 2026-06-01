// 서비스 롤 키로 이메일 확정(confirmed)된 테스트 계정을 생성한다(멱등).
// 전체 CRUD e2e(E2E_SUPABASE=1)가 로그인할 수 있게 한다.
// GoTrue admin REST를 fetch로 직접 호출(Node 20 WebSocket 의존 회피).
// 사용: node scripts/seed-test-user.mjs  (env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, E2E_EMAIL, E2E_PASSWORD)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error("환경변수 필요: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, E2E_EMAIL, E2E_PASSWORD");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

async function findUser() {
  const res = await fetch(
    `${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
    { headers }
  );
  if (!res.ok) return null;
  const body = await res.json();
  const list = body.users ?? body;
  return Array.isArray(list) ? list.find((u) => u.email === email) : null;
}

// 생성 시도
let res = await fetch(`${url}/auth/v1/admin/users`, {
  method: "POST",
  headers,
  body: JSON.stringify({ email, password, email_confirm: true }),
});

if (res.ok) {
  const u = await res.json();
  console.log(`테스트 계정 생성: ${email} (${u.id})`);
  process.exit(0);
}

// 이미 존재 등 → 기존 사용자 찾아 비밀번호/확정 갱신(멱등)
const errText = await res.text();
const existing = await findUser();
if (existing) {
  const upd = await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password, email_confirm: true }),
  });
  if (upd.ok) {
    console.log(`기존 테스트 계정 갱신: ${email} (${existing.id})`);
    process.exit(0);
  }
  console.error("계정 갱신 실패:", await upd.text());
  process.exit(1);
}

console.error("계정 생성 실패:", res.status, errText);
process.exit(1);
