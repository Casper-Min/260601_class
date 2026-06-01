"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { goalCreateSchema, goalUpdateSchema, goalIdSchema } from "./schema";

export type ActionState = { error?: string };

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/goals");
  return { supabase, userId: user.id };
}

export async function createGoal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = goalCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력이 올바르지 않습니다" };
  }

  const { supabase, userId } = await requireUserId();
  const { error } = await supabase.from("goals").insert({
    user_id: userId,
    title: parsed.data.title,
    description: parsed.data.description || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/goals");
  return {};
}

export async function updateGoal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = goalUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력이 올바르지 않습니다" };
  }

  const { supabase, userId } = await requireUserId();
  // RLS가 본인 행만 허용하지만, user_id 조건을 명시해 이중 방어한다.
  const { error } = await supabase
    .from("goals")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/goals");
  return {};
}

export async function deleteGoal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = goalIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "잘못된 요청입니다" };

  const { supabase, userId } = await requireUserId();
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/goals");
  return {};
}
