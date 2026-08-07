"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function addFavourite(formData) {
  const { supabase, user } = await requireUser();
  const videoId = formData.get("videoId")?.toString();
  const redirectPath = formData.get("redirectPath")?.toString() || "/library";

  if (!videoId) {
    return;
  }

  await supabase
    .from("favourites")
    .upsert(
      { user_id: user.id, video_id: videoId },
      { onConflict: "user_id,video_id", ignoreDuplicates: true }
    );

  revalidatePath(redirectPath);
  revalidatePath("/favourites");
}

export async function removeFavourite(formData) {
  const { supabase, user } = await requireUser();
  const videoId = formData.get("videoId")?.toString();
  const redirectPath = formData.get("redirectPath")?.toString() || "/library";

  if (!videoId) {
    return;
  }

  await supabase
    .from("favourites")
    .delete()
    .eq("user_id", user.id)
    .eq("video_id", videoId);

  revalidatePath(redirectPath);
  revalidatePath("/favourites");
}
