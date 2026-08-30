"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminApiConfigured } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";

function redirectWithError(message) {
  redirect(`/account/billing?error=${encodeURIComponent(message)}`);
}

// Self-service cancel for the signed-in subscriber's own subscription.
// subscriptions has no user-writable RLS policy (by design -- see
// supabase/migrations/20260815000000_platform_hardening.sql), so the
// regular session client can only read the row to confirm ownership; the
// actual cancellation (Stripe + DB update) runs through the service role,
// same as the admin cancel action.
export async function cancelMySubscription() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, stripe_subscription_id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (!subscription) {
    redirect("/account/billing");
  }

  if (!isAdminApiConfigured()) {
    redirectWithError("Cancellation isn't available yet. Please contact support.");
  }

  const adminSupabase = createAdminClient();

  if (subscription.stripe_subscription_id) {
    try {
      const stripe = getStripeClient();
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    } catch (err) {
      console.error("Failed to cancel subscription in Stripe:", err);
      redirectWithError("Could not cancel your subscription. Please try again or contact support.");
    }
  }

  const { error } = await adminSupabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("id", subscription.id);

  if (error) {
    redirectWithError("Could not cancel your subscription. Please try again or contact support.");
  }

  revalidatePath("/account/billing");
  redirect("/account/billing");
}
