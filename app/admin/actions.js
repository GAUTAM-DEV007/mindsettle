"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Server Actions run their own auth check rather than trusting the page
// to have already gated access — RLS is the real backstop (see the
// "Admins can insert/update/delete categories" policies in
// database-schema.sql), this just gives a clean redirect instead of a
// raw Postgres permission error.
async function requireAdminClient() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

function redirectWithError(message) {
  redirect(`/admin?categoryError=${encodeURIComponent(message)}`);
}

export async function addCategory(formData) {
  const supabase = await requireAdminClient();

  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();

  if (!name || !slug) {
    redirectWithError("Name and slug are required.");
  }

  const { error } = await supabase.from("categories").insert({ name, slug });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function updateCategory(formData) {
  const supabase = await requireAdminClient();

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();

  if (!id || !name || !slug) {
    redirectWithError("Name and slug are required.");
  }

  const { error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function deleteCategory(formData) {
  const supabase = await requireAdminClient();

  const id = formData.get("id")?.toString();

  if (!id) {
    redirectWithError("Category id is required.");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}
