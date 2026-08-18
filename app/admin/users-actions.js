"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

function redirectWithError(message) {
  redirect(`/admin?usersError=${encodeURIComponent(message)}`);
}

const VALID_ROLES = ["user", "organisation", "admin"];

export async function changeUserRole(formData) {
  await requireRole("admin");

  const userId = formData.get("userId")?.toString();
  const role = formData.get("role")?.toString();

  if (!userId || !VALID_ROLES.includes(role)) {
    redirectWithError("Invalid role change request.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function setUserSuspended(userId, suspended) {
  await requireRole("admin");

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: suspended ? "876000h" : "none",
  });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function deleteUserAccount(userId) {
  await requireRole("admin");

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}
