import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Receives subscription/invoice lifecycle events from Stripe and syncs
// them into the Supabase `subscriptions` and `invoices` tables using the
// service role key (this endpoint is unauthenticated -- there's no user
// session, only a signed Stripe payload).
//
// Expects the Stripe customer or subscription to carry
// `metadata.user_id` set to the Supabase auth user id -- set that
// whenever you create the Stripe customer/checkout session. Without it,
// events for that customer are logged and skipped rather than guessed at.
export async function POST(request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Billing is intentionally fail-closed until both secrets are
  // configured. Returning success here would silently discard real
  // subscription changes; letting getStripeClient() throw instead would
  // produce an opaque 500 rather than this explicit response.
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Subscription webhooks are not configured." },
      { status: 503 }
    );
  }

  const stripe = getStripeClient();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(supabase, stripe, event.data.object);
        break;

      case "invoice.created":
      case "invoice.finalized":
      case "invoice.paid":
      case "invoice.payment_failed":
        await syncInvoice(supabase, stripe, event.data.object);
        break;

      default:
        // Ignore event types we don't track.
        break;
    }
  } catch (err) {
    console.error(`Failed to process Stripe event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function resolveUserId(stripe, { customerId, metadata }) {
  if (metadata?.user_id) {
    return metadata.user_id;
  }

  const customer = await stripe.customers.retrieve(customerId);
  return customer?.metadata?.user_id ?? null;
}

const SUBSCRIPTION_STATUS_MAP = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  unpaid: "past_due",
  paused: "canceled",
};

async function syncSubscription(supabase, stripe, subscription) {
  const userId = await resolveUserId(stripe, {
    customerId: subscription.customer,
    metadata: subscription.metadata,
  });

  if (!userId) {
    console.warn(
      `Skipping subscription ${subscription.id}: no metadata.user_id for customer ${subscription.customer}.`
    );
    return;
  }

  const status = SUBSCRIPTION_STATUS_MAP[subscription.status] ?? "incomplete";
  const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  // Resolve the internal plan row from the Stripe price id so entitlement
  // checks (public.user_has_active_entitlement) have a tier to compare
  // against. A plan's stripe_price_id is set from Admin -> Plan
  // Management once the plan is created in Stripe.
  let planId = null;
  let planName = null;

  if (priceId) {
    const { data: planRow } = await supabase
      .from("subscription_plans")
      .select("id, name")
      .eq("stripe_price_id", priceId)
      .maybeSingle();

    if (planRow) {
      planId = planRow.id;
      planName = planRow.name;
    } else {
      console.warn(
        `No plan found with stripe_price_id ${priceId} -- subscription ${subscription.id} will sync without a plan/tier until Admin -> Plan Management is given this price id.`
      );
    }
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      status,
      plan: planName ?? subscription.items?.data?.[0]?.price?.nickname ?? null,
      plan_id: planId,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (error) {
    throw error;
  }
}

async function syncInvoice(supabase, stripe, invoice) {
  const userId = await resolveUserId(stripe, {
    customerId: invoice.customer,
    metadata: invoice.metadata,
  });

  if (!userId) {
    console.warn(
      `Skipping invoice ${invoice.id}: no metadata.user_id for customer ${invoice.customer}.`
    );
    return;
  }

  let subscriptionRowId = null;

  if (invoice.subscription) {
    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", invoice.subscription)
      .single();

    subscriptionRowId = subRow?.id ?? null;
  }

  const { error } = await supabase.from("invoices").upsert(
    {
      user_id: userId,
      subscription_id: subscriptionRowId,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      period_start: invoice.period_start
        ? new Date(invoice.period_start * 1000).toISOString()
        : null,
      period_end: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : null,
    },
    { onConflict: "stripe_invoice_id" }
  );

  if (error) {
    throw error;
  }
}
