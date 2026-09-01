"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminApiConfigured } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";
import { getSiteUrl } from "@/lib/auth/site-url";

function redirectWithError(message) {
  redirect(`/account/billing?error=${encodeURIComponent(message)}`);
}

// The customer id is read from an owned, server-managed row, never from a form.
export async function openBillingPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.app_metadata?.must_change_password === true) redirect("/set-password");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !subscription?.stripe_customer_id) {
    redirectWithError("Online billing is not available for this account. Please contact support.");
  }

  let portalUrl;
  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getSiteUrl()}/account/billing`,
    });
    portalUrl = session.url;
  } catch (error) {
    console.error("Could not open billing portal:", error);
    redirectWithError("Online billing is temporarily unavailable. Please try again or contact support.");
  }
  redirect(portalUrl);
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
  if (user.app_metadata?.must_change_password === true) redirect("/set-password");

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("id, stripe_subscription_id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionError) redirectWithError("Could not load your subscription. Please try again.");

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
