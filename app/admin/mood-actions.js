"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function requireAdminClient() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  const {
    data: roleRecord,
    error: roleError,
  } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (
    roleError ||
    roleRecord?.role !== "admin"
  ) {
    redirect("/");
  }

  return supabase;
}

function normaliseSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateMoodPages() {
  revalidatePath("/admin");
  revalidatePath("/mood");
  revalidatePath("/library");
  revalidatePath("/dashboard");
}

/* =========================================================
   ADD MOOD
========================================================= */

export async function addMood(
  formData
) {
  const supabase =
    await requireAdminClient();

  const name =
    formData
      .get("name")
      ?.toString()
      .trim();

  const slug =
    normaliseSlug(
      formData.get("slug")
    );

  const emoji =
    formData
      .get("emoji")
      ?.toString()
      .trim() || null;

  const description =
    formData
      .get("description")
      ?.toString()
      .trim() || null;

  if (!name || !slug) {
    throw new Error(
      "Mood name and slug are required."
    );
  }

  const { error } =
    await supabase
      .from("moods")
      .insert({
        name,
        slug,
        emoji,
        description,
      });

  if (error) {
    throw new Error(
      `Failed to add mood: ${error.message}`
    );
  }

  revalidateMoodPages();
}

/* =========================================================
   UPDATE MOOD
========================================================= */

export async function updateMood(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  const name =
    formData
      .get("name")
      ?.toString()
      .trim();

  const slug =
    normaliseSlug(
      formData.get("slug")
    );

  const emoji =
    formData
      .get("emoji")
      ?.toString()
      .trim() || null;

  const description =
    formData
      .get("description")
      ?.toString()
      .trim() || null;

  if (!id) {
    throw new Error(
      "Mood id is required."
    );
  }

  if (!name || !slug) {
    throw new Error(
      "Mood name and slug are required."
    );
  }

  const { error } =
    await supabase
      .from("moods")
      .update({
        name,
        slug,
        emoji,
        description,
      })
      .eq("id", id);

  if (error) {
    throw new Error(
      `Failed to update mood: ${error.message}`
    );
  }

  revalidateMoodPages();
}

/* =========================================================
   DELETE MOOD
========================================================= */

export async function deleteMood(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  if (!id) {
    throw new Error(
      "Mood id is required."
    );
  }

  /*
   * Remove mood relationships only.
   * The videos themselves are NOT deleted.
   */
  const {
    error: relationshipError,
  } = await supabase
    .from("video_moods")
    .delete()
    .eq("mood_id", id);

  if (relationshipError) {
    throw new Error(
      `Failed to remove mood assignments: ${relationshipError.message}`
    );
  }

  const { error } =
    await supabase
      .from("moods")
      .delete()
      .eq("id", id);

  if (error) {
    throw new Error(
      `Failed to delete mood: ${error.message}`
    );
  }

  revalidateMoodPages();
}