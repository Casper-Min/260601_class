import "server-only";
import { createClient } from "@supabase/supabase-js";

// 서버 전용 admin 클라이언트. service role key를 사용하므로 절대 클라이언트로 import 금지.
// `server-only` import가 클라이언트 번들 포함 시 빌드 에러를 발생시켜 노출을 차단한다.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
