"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient, isAdminApiConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;

function validatePassword(password) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use no more than ${PASSWORD_MAX_LENGTH} characters.`;
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include an uppercase letter, a lowercase letter, and a number.";
  }

  return null;
}

export async function setInitialPassword(_previousState, formData) {
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "");
  const passwordError = validatePassword(password);

  if (passwordError) return { error: passwordError };
  if (password !== confirmation) return { error: "The passwords do not match." };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");
  if (user.app_metadata?.must_change_password !== true) redirect("/post-login");

  if (!isAdminApiConfigured()) {
    return { error: "Password onboarding is not configured. Please contact your organisation administrator." };
  }

  const organisationId = user.app_metadata?.organisation_id;
  if (!organisationId) {
    return { error: "This invitation is missing its organisation. Please contact support." };
  }

  const { error: passwordUpdateError } = await supabase.auth.updateUser({ password });

  if (passwordUpdateError) {
    return { error: passwordUpdateError.message || "Could not update your password. Please try again." };
  }

  const admin = createAdminClient();
  const completedAt = new Date().toISOString();
  const { data: memberships, error: membershipError } = await admin
    .from("organisation_members")
    .update({
      status: "active",
      onboarding_completed_at: completedAt,
    })
    .eq("user_id", user.id)
    .eq("organisation_id", organisationId)
    // Include active rows so retrying after a metadata failure is safe.
    .in("status", ["pending", "invited", "active"])
    .select("id");

  if (membershipError || !memberships?.length) {
    return {
      error: "Your password was updated, but your organisation membership could not be activated. Sign in with your new password and try again, or contact your administrator.",
    };
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      must_change_password: false,
      password_changed_at: completedAt,
    },
  });

  if (metadataError) {
    return {
      error: "Your password was updated, but setup could not be completed. Sign in with your new password and try again.",
    };
  }

  // Issue a fresh JWT containing the updated protected app metadata.
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    redirect("/login?notice=password-updated");
  }

  revalidatePath("/dashboard");
  revalidatePath("/library");
  revalidatePath("/post-login");
  redirect("/post-login");
}
