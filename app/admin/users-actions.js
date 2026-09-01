"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

function redirectWithError(message) {
  redirect(`/admin?usersError=${encodeURIComponent(message)}`);
}

const VALID_ROLES = ["user", "organisation", "admin"];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function changeUserRole(formData) {
  const { user } = await requireRole("admin");

  const userId = formData.get("userId")?.toString();
  const role = formData.get("role")?.toString();

  if (!UUID_RE.test(userId || "") || !VALID_ROLES.includes(role)) {
    redirectWithError("Invalid role change request.");
  }

  if (userId === user.id) {
    redirectWithError("You cannot change your own administrator role.");
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
  const { user } = await requireRole("admin");

  if (!UUID_RE.test(String(userId || ""))) {
    redirectWithError("Invalid user suspension request.");
  }

  if (userId === user.id) {
    redirectWithError("You cannot suspend your own administrator account.");
  }

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
  const { user } = await requireRole("admin");

  if (!UUID_RE.test(String(userId || ""))) {
    redirectWithError("Invalid account deletion request.");
  }

  if (userId === user.id) {
    redirectWithError("You cannot delete your own administrator account.");
  }

  const supabase = createAdminClient();
  // Deleting auth cascades the local subscription rows, but does not cancel
  // Stripe. Preserve the account until billing is stopped so it cannot keep
  // charging after its customer/subscription references disappear locally.
  const { data: billableSubscriptions, error: billingError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .not("stripe_subscription_id", "is", null)
    .neq("status", "canceled")
    .limit(1);

  if (billingError) {
    redirectWithError("Could not verify billing status. Account deletion was not performed.");
  }
  if (billableSubscriptions?.length) {
    redirectWithError("Cancel this user's Stripe subscriptions before deleting the account.");
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}
