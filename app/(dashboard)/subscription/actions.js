"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";
import { getSiteUrl } from "@/lib/auth/site-url";
import {
  MAX_SELF_SERVE_ORGANISATION_SEATS,
  MIN_ORGANISATION_SEATS,
  calculateOrganisationPrice,
} from "@/lib/billing/organisation-pricing";

function redirectWithError(message) {
  redirect(`/subscription?error=${encodeURIComponent(message)}`);
}

// Starts a Stripe Checkout session for the chosen plan. Individual plans use
// quantity 1; the flexible organisation plan sends the validated purchased
// seat quantity to Stripe's graduated recurring Price.
export async function startCheckout(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/subscription`);
  }

  const planId = formData.get("planId")?.toString();
  if (user.app_metadata?.must_change_password === true) redirect("/set-password");

  if (!planId) {
    redirectWithError("Choose a plan first.");
  }

  const [{ data: plan, error: planError }, { data: roleRecord, error: roleError }, { data: activeSubscription, error: subscriptionError }] =
    await Promise.all([
      supabase
        .from("subscription_plans")
        .select("id, slug, name, type, currency, billing_cycle, stripe_price_id, is_active")
        .eq("id", planId)
        .single(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .limit(1)
        .maybeSingle(),
    ]);

  if (planError || !plan || !plan.is_active) {
    redirectWithError("That plan is not available.");
  }

  if (roleError || !roleRecord || subscriptionError) {
    redirectWithError("Could not verify your account and subscription. Please try again.");
  }

  const isOrganisation = roleRecord?.role === "organisation";
  const expectedPlanType = isOrganisation ? "organisation" : "individual";

  if (plan.type !== expectedPlanType) {
    redirectWithError("That plan is not available for this account type.");
  }

  if (activeSubscription) {
    redirect(`/account/billing?error=${encodeURIComponent("You already have an active subscription.")}`);
  }

  let seatQuantity = 1;
  let pricing = null;

  if (isOrganisation) {
    if (plan.slug !== "organisation-flex") {
      redirectWithError("Choose the flexible organisation seat plan.");
    }

    const requestedSeats = Math.round(Number(formData.get("seatQuantity")));

    if (
      !Number.isFinite(requestedSeats) ||
      requestedSeats < MIN_ORGANISATION_SEATS ||
      requestedSeats > MAX_SELF_SERVE_ORGANISATION_SEATS
    ) {
      redirectWithError(
        `Choose between ${MIN_ORGANISATION_SEATS} and ${MAX_SELF_SERVE_ORGANISATION_SEATS} member seats.`
      );
    }

    seatQuantity = requestedSeats;
    pricing = calculateOrganisationPrice(seatQuantity);
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
        name: user.user_metadata?.organisation_name || user.user_metadata?.full_name || undefined,
        metadata: {
          user_id: user.id,
          account_type: isOrganisation ? "organisation" : "individual",
        },
      });

      customerId = customer.id;
    }

    const origin = getSiteUrl();
    const metadata = {
      user_id: user.id,
      account_type: isOrganisation ? "organisation" : "individual",
      plan_id: plan.id,
      seat_quantity: String(seatQuantity),
      ...(pricing ? { expected_monthly_cents: String(pricing.totalCents) } : {}),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: seatQuantity }],
      metadata,
      subscription_data: { metadata },
      success_url: isOrganisation
        ? `${origin}/organisation-dashboard?checkout=success`
        : `${origin}/account/billing?checkout=success`,
      cancel_url: `${origin}/subscription?checkout=cancelled${
        isOrganisation ? `&seats=${seatQuantity}` : ""
      }`,
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

// Starts a 1-day free trial of Individual Premium (monthly) with no card
// required up front. `payment_method_collection: "if_required"` tells
// Stripe Checkout to only ask for a payment method if something is
// actually due today -- with trial_period_days set, $0 is due today, so
// the card step is skipped entirely. If the trial isn't converted to a
// paid card before it ends, Stripe cancels the subscription on its own;
// that's expected behaviour for a card-optional trial, not a bug here.
export async function startFreeTrial() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/subscription`);
  }

  if (user.app_metadata?.must_change_password === true) redirect("/set-password");

  const [{ data: roleRecord, error: roleError }, { data: activeSubscription, error: subscriptionError }] = await Promise.all([
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .limit(1)
      .maybeSingle(),
  ]);

  if (roleError || !roleRecord || subscriptionError) {
    redirectWithError("Could not verify your account and subscription. Please try again.");
  }

  if (roleRecord?.role === "organisation") {
    redirectWithError("Free trials are available for individual accounts only.");
  }

  if (activeSubscription) {
    redirect(`/account/billing?error=${encodeURIComponent("You already have an active subscription.")}`);
  }

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("id, name, stripe_price_id, is_active")
    .eq("slug", "individual-premium")
    .single();

  if (planError || !plan || !plan.is_active) {
    redirectWithError("Free trial isn't available right now.");
  }

  if (!plan.stripe_price_id) {
    redirectWithError(
      "Free trial isn't connected to Stripe yet — an admin needs to add its price id in Plan Management."
    );
  }

  // A trial is a once-per-account offer. Active-only checks allow a user
  // whose earlier trial was cancelled or expired to repeatedly claim it.
  const { data: previousTrialSubscription, error: previousTrialError } =
    await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan_id", plan.id)
      .limit(1)
      .maybeSingle();

  if (previousTrialError) {
    console.error("Could not verify previous trial use:", previousTrialError);
    redirectWithError("Could not verify trial eligibility. Please try again.");
  }

  if (previousTrialSubscription) {
    redirectWithError("The free trial has already been used on this account.");
  }

  let stripe;

  try {
    stripe = getStripeClient();
  } catch {
    redirectWithError("Trials aren't configured yet. Try again later.");
  }

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

    const origin = getSiteUrl();

    const trialMetadata = {
      user_id: user.id,
      account_type: "individual",
      plan_id: plan.id,
      trial_offer: "individual-premium-1d",
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      subscription_data: {
        trial_period_days: 1,
        trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
        metadata: trialMetadata,
      },
      metadata: trialMetadata,
      payment_method_collection: "if_required",
      success_url: `${origin}/account/billing?checkout=trial-started`,
      cancel_url: `${origin}/subscription?checkout=cancelled`,
    });

    if (!session.url) {
      redirectWithError("Could not start your trial. Please try again.");
    }

    redirect(session.url);
  } catch (err) {
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }

    console.error("Stripe trial checkout session creation failed:", err);
    redirectWithError("Could not start your trial. Please try again.");
  }
}
