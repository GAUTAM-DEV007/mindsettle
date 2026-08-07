"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = formData.get("fullName")?.toString().trim() || null;
  const avatarUrl = formData.get("avatarUrl")?.toString().trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/account");
}
