"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function safeRevalidationPath(value) {
  const path = String(value || "");
  return path.startsWith("/") && !path.startsWith("//") && path.length <= 200
    ? path
    : "/library";
}

export async function addFavourite(formData) {
  const { supabase, user } = await requireUser();
  const videoId = formData.get("videoId")?.toString();
  const redirectPath = safeRevalidationPath(formData.get("redirectPath"));

  if (!UUID_RE.test(videoId || "")) {
    return;
  }

  const { error } = await supabase
    .from("favourites")
    .upsert(
      { user_id: user.id, video_id: videoId },
      { onConflict: "user_id,video_id", ignoreDuplicates: true }
    );

  if (error) {
    throw new Error("We could not save this favourite. Please try again.");
  }

  revalidatePath(redirectPath);
  revalidatePath("/favourites");
}

export async function removeFavourite(formData) {
  const { supabase, user } = await requireUser();
  const videoId = formData.get("videoId")?.toString();
  const redirectPath = safeRevalidationPath(formData.get("redirectPath"));

  if (!UUID_RE.test(videoId || "")) {
    return;
  }

  const { error } = await supabase
    .from("favourites")
    .delete()
    .eq("user_id", user.id)
    .eq("video_id", videoId);

  if (error) {
    throw new Error("We could not remove this favourite. Please try again.");
  }

  revalidatePath(redirectPath);
  revalidatePath("/favourites");
}
