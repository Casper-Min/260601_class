import { createBrowserClient } from "@supabase/ssr";

// 브라우저(Client Component)용. anon key만 사용한다.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
