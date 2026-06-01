import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버(Server Component / Server Action / Route Handler)용. anon key + 쿠키 기반 세션.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출되면 set이 불가할 수 있다(미들웨어가 세션 갱신 담당).
          }
        },
      },
    }
  );
}
