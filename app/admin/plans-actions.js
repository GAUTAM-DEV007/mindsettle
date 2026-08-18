"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// plans has a direct "Admins manage plans" RLS policy (see
// supabase/migrations/20260818000000_plans_and_entitlements.sql), so this
// runs through the regular session client under RLS -- same pattern as
// categories/moods -- rather than needing the service role key.
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
  redirect(`/admin?planError=${encodeURIComponent(message)}`);
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readPlanFields(formData) {
  const name = formData.get("name")?.toString().trim();
  const type = formData.get("type")?.toString();
  const priceDollars = formData.get("price")?.toString();
  const billingCycle = formData.get("billingCycle")?.toString();
  const seatLimitRaw = formData.get("seatLimit")?.toString().trim();
  const tierRaw = formData.get("tier")?.toString();
  const stripePriceId = formData.get("stripePriceId")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  return {
    name,
    type,
    price_cents: Math.round((Number(priceDollars) || 0) * 100),
    billing_cycle: billingCycle === "yearly" ? "yearly" : "monthly",
    seat_limit: seatLimitRaw ? Math.max(1, Math.round(Number(seatLimitRaw))) : null,
    tier: Math.max(1, Math.round(Number(tierRaw) || 1)),
    stripe_price_id: stripePriceId || null,
    description: description || null,
    is_active: formData.get("isActive") === "on",
  };
}

export async function addPlan(formData) {
  const supabase = await requireAdminClient();
  const fields = readPlanFields(formData);

  if (!fields.name || !["individual", "organisation"].includes(fields.type)) {
    redirectWithError("Name and plan type are required.");
  }

  const { error } = await supabase.from("subscription_plans").insert({
    ...fields,
    slug: slugify(`${fields.name}-${Date.now().toString(36)}`),
  });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function updatePlan(formData) {
  const supabase = await requireAdminClient();
  const id = formData.get("id")?.toString();
  const fields = readPlanFields(formData);

  if (!id || !fields.name) {
    redirectWithError("Plan id and name are required.");
  }

  const { error } = await supabase.from("subscription_plans").update(fields).eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function deletePlan(formData) {
  const supabase = await requireAdminClient();
  const id = formData.get("id")?.toString();

  if (!id) {
    redirectWithError("Plan id is required.");
  }

  const { error } = await supabase.from("subscription_plans").delete().eq("id", id);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}

export async function updateVideoTier(formData) {
  const supabase = await requireAdminClient();
  const videoId = formData.get("videoId")?.toString();
  const minTier = Number(formData.get("minTier"));

  if (!videoId || Number.isNaN(minTier) || minTier < 0) {
    redirectWithError("Invalid video access level.");
  }

  const { error } = await supabase
    .from("videos")
    .update({ min_tier: minTier, is_premium: minTier > 0 })
    .eq("id", videoId);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}
