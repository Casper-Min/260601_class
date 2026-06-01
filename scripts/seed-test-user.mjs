// 서비스 롤 키로 이메일 확정(confirmed)된 테스트 계정을 생성한다(멱등).
// 전체 CRUD e2e(E2E_SUPABASE=1)가 로그인할 수 있게 한다.
// 사용: node scripts/seed-test-user.mjs  (env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, E2E_EMAIL, E2E_PASSWORD)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error("환경변수 필요: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, E2E_EMAIL, E2E_PASSWORD");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  // 이미 존재하면 비밀번호를 맞춰주고 통과(멱등).
  if (/already|exists|registered/i.test(error.message)) {
    const { data: list } = await admin.auth.admin.listUsers();
    const u = list?.users?.find((x) => x.email === email);
    if (u) {
      await admin.auth.admin.updateUserById(u.id, { password, email_confirm: true });
      console.log(`기존 테스트 계정 갱신: ${email}`);
      process.exit(0);
    }
  }
  console.error("계정 생성 실패:", error.message);
  process.exit(1);
}

console.log(`테스트 계정 생성: ${email} (${data.user?.id})`);
