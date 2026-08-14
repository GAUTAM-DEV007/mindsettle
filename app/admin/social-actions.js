"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   ADMIN AUTH
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function redirectWithSocialError(
  message
) {
  redirect(
    `/admin?socialError=${encodeURIComponent(
      message
    )}`
  );
}

function checkboxValue(value) {
  return (
    value === "on" ||
    value === "true" ||
    value === "1"
  );
}

function normaliseUrl(value) {
  const url =
    String(value || "").trim();

  if (!url) {
    return null;
  }

  try {
    const parsed =
      new URL(url);

    if (
      parsed.protocol !==
        "https:" &&
      parsed.protocol !==
        "http:"
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function revalidateSocialPages() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/library");
  revalidatePath("/programs");
  revalidatePath("/mood");
  revalidatePath("/favourites");
}

/* =========================================================
   ADD SOCIAL LINK
========================================================= */

export async function addSocialLink(
  formData
) {
  const supabase =
    await requireAdminClient();

  const platform =
    formData
      .get("platform")
      ?.toString()
      .trim();

  const rawUrl =
    formData
      .get("url")
      ?.toString()
      .trim();

  const isEnabled =
    checkboxValue(
      formData.get(
        "isEnabled"
      )
    );

  const sortOrderRaw =
    formData
      .get("sortOrder")
      ?.toString();

  const sortOrder =
    Number(sortOrderRaw) ||
    1;

  if (!platform) {
    redirectWithSocialError(
      "Platform name is required."
    );
  }

  const url =
    rawUrl
      ? normaliseUrl(
          rawUrl
        )
      : null;

  if (
    rawUrl &&
    !url
  ) {
    redirectWithSocialError(
      "Please enter a valid social media URL starting with http:// or https://."
    );
  }

  const { error } =
    await supabase
      .from("social_links")
      .insert({
        platform,
        url,

        is_enabled:
          isEnabled,

        sort_order:
          sortOrder,
      });

  if (error) {
    redirectWithSocialError(
      error.message
    );
  }

  revalidateSocialPages();
}

/* =========================================================
   UPDATE SOCIAL LINK
========================================================= */

export async function updateSocialLink(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  const platform =
    formData
      .get("platform")
      ?.toString()
      .trim();

  const rawUrl =
    formData
      .get("url")
      ?.toString()
      .trim();

  const isEnabled =
    checkboxValue(
      formData.get(
        "isEnabled"
      )
    );

  const sortOrderRaw =
    formData
      .get("sortOrder")
      ?.toString();

  const sortOrder =
    Number(sortOrderRaw) ||
    1;

  if (!id) {
    redirectWithSocialError(
      "Social link id is required."
    );
  }

  if (!platform) {
    redirectWithSocialError(
      "Platform name is required."
    );
  }

  const url =
    rawUrl
      ? normaliseUrl(
          rawUrl
        )
      : null;

  if (
    rawUrl &&
    !url
  ) {
    redirectWithSocialError(
      "Please enter a valid social media URL starting with http:// or https://."
    );
  }

  const { error } =
    await supabase
      .from("social_links")
      .update({
        platform,
        url,

        is_enabled:
          isEnabled,

        sort_order:
          sortOrder,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

  if (error) {
    redirectWithSocialError(
      error.message
    );
  }

  revalidateSocialPages();
}

/* =========================================================
   DELETE SOCIAL LINK
========================================================= */

export async function deleteSocialLink(
  formData
) {
  const supabase =
    await requireAdminClient();

  const id =
    formData
      .get("id")
      ?.toString();

  if (!id) {
    redirectWithSocialError(
      "Social link id is required."
    );
  }

  const { error } =
    await supabase
      .from("social_links")
      .delete()
      .eq("id", id);

  if (error) {
    redirectWithSocialError(
      error.message
    );
  }

  revalidateSocialPages();
}