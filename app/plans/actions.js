"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";

function redirectWithError(message) {
  redirect(`/plans?error=${encodeURIComponent(message)}`);
}

async function getOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

// Starts a Stripe Checkout session for the chosen plan (individual or
// organisation -- same flow either way, the plan row just carries a
// different `type`/`seat_limit`). Redirects to Stripe's hosted page.
export async function startCheckout(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/plans`);
  }

  const planId = formData.get("planId")?.toString();

  if (!planId) {
    redirectWithError("Choose a plan first.");
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, name, stripe_price_id, is_active")
    .eq("id", planId)
    .single();

  if (planError || !plan || !plan.is_active) {
    redirectWithError("That plan is not available.");
  }

  if (!plan.stripe_price_id) {
    redirectWithError(
      `${plan.name} isn't connected to Stripe yet — an admin needs to add its price id in Plan Management.`
    );
  }

  let stripe;

  try {
    stripe = getStripeClient();
  } catch {
    redirectWithError("Payments aren't configured yet. Try again later.");
  }

  // Reuse an existing Stripe customer if this user already has one from a
  // prior subscription, otherwise create one with metadata.user_id so the
  // webhook can attribute future events to this account without guessing.
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id ?? null;

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });

      customerId = customer.id;
    }

    const origin = await getOrigin();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${origin}/account/billing?checkout=success`,
      cancel_url: `${origin}/plans?checkout=cancelled`,
    });

    if (!session.url) {
      redirectWithError("Could not start checkout. Please try again.");
    }

    redirect(session.url);
  } catch (err) {
    // Next.js's redirect() throws internally to unwind -- let that pass
    // through instead of being reported as a Stripe failure.
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }

    console.error("Stripe checkout session creation failed:", err);
    redirectWithError("Could not start checkout. Please try again.");
  }
}

export async function continueWithFreeAccess() {
  redirect("/dashboard");
}
