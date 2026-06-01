import { createClient } from "@/lib/supabase/server";
import type { Goal } from "./types";

// 현재 로그인 사용자의 목표 목록. RLS로 본인 행만 반환된다.
export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Goal[];
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
