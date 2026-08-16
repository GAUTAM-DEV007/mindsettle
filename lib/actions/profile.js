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
  const rawAvatarUrl = formData.get("avatarUrl")?.toString().trim() || null;

  if (fullName && fullName.length > 100) throw new Error("Full name must be 100 characters or fewer.");

  let avatarUrl = null;
  if (rawAvatarUrl) {
    try {
      const parsed = new URL(rawAvatarUrl);
      if (!["http:", "https:"].includes(parsed.protocol) || rawAvatarUrl.length > 2048) throw new Error();
      avatarUrl = parsed.toString();
    } catch {
      throw new Error("Avatar URL must be a valid http or https address.");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl }, { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/account");
}
