import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startCheckout, continueWithFreeAccess, startFreeTrial } from "./actions";

// Short, honest "what you get" bullets per plan -- keyed by slug so both
// PlanCard and FreeCard can share the same list without duplicating copy.
const BENEFITS = {
  free: ["3 free guided sessions", "No card required", "Browse the full catalogue"],
  "individual-premium": ["Unlimited guided sessions", "New content added regularly", "Cancel anytime"],
  "individual-premium-annual": [
    "Unlimited guided sessions",
    "New content added regularly",
    "Cancel anytime",
  ],
  "organisation-starter": ["Team-wide library access", "Simple member management", "Cancel anytime"],
  "organisation-professional": [
    "Team-wide library access",
    "Simple member management",
    "Cancel anytime",
  ],
  "organisation-enterprise": [
    "Team-wide library access",
    "Simple member management",
    "Cancel anytime",
  ],
};

export const dynamic = "force-dynamic";

function formatPrice(cents, cycle) {
  if (!cents) {
    return "Free";
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "usd",
  }).format(cents / 100);

  return `${amount}/${cycle === "yearly" ? "yr" : "mo"}`;
}

// Benefit-first copy per audience -- Netflix-style plan pages lead with why
// you're here, not a bare price table. Kept short: this screen's job is to
// get a decision made, not to sell.
const COPY = {
  individual: {
    eyebrow: "MindSettle Premium",
    headline: "Full access to every calming session, whenever you need it.",
    subtext:
      "Guided sessions, nature soundscapes and mindful routines, unlocked the moment you subscribe. Or continue with a handful of free videos to try MindSettle first.",
  },
  organisation: {
    eyebrow: "MindSettle for Organisations",
    headline: "Bring calming, evidence-based sessions to your whole team.",
    subtext:
      "Give every staff member or resident sign-in access to MindSettle's full library, with seats that scale to your organisation.",
  },
};

export default async function PlansPage({ searchParams }) {
  const { error } = searchParams ? await searchParams : {};

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/subscription");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isOrganisation = roleRecord?.role === "organisation";

  // Only the audience's own plan type is fetched -- this is a first-run,
  // paywall-style decision screen, not a general pricing directory, so an
  // individual account never sees organisation seat tiers and vice versa.
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("id, slug, name, description, price_cents, billing_cycle, seat_limit, tier, is_active")
    .eq("is_active", true)
    .eq("type", isOrganisation ? "organisation" : "individual")
    .order("sort_order", { ascending: true });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_id")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const copy = isOrganisation ? COPY.organisation : COPY.individual;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
          {copy.eyebrow}
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[#163d34] sm:text-4xl">
          {copy.headline}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5a6d66]">{copy.subtext}</p>
      </div>

      {error && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {subscription && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[#9bb98a] bg-[#dce8ca]/60 px-5 py-4 text-center text-sm font-semibold text-[#163d34]">
          {subscription.status === "trialing"
            ? "You're currently on a free trial."
            : "You already have an active subscription."}{" "}
          <Link href="/account/billing" className="underline">
            Manage billing
          </Link>
        </div>
      )}

      <section className="mt-12">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {!isOrganisation && <FreeCard hasSubscription={Boolean(subscription)} />}

          {(plans || []).length === 0 && (
            <p className="text-center text-sm text-[#6c8178]">Plans aren&apos;t available yet.</p>
          )}

          {(plans || []).map((plan) => (
            <PlanCard key={plan.id} plan={plan} isCurrent={subscription?.plan_id === plan.id} />
          ))}
        </div>

        {!isOrganisation && !subscription && (
          <div className="mt-8 text-center">
            <form action={startFreeTrial}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-[#163d34] px-6 py-2.5 text-sm font-semibold text-[#163d34] transition hover:bg-[#163d34] hover:text-white"
              >
                Start Free Trial
              </button>
            </form>
            <p className="mt-2 text-xs text-[#84948d]">
              1 day of full access, no card required to start.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function BenefitList({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className="mt-4 space-y-1.5 text-sm text-[#3f5850]">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-0.5 text-[#78906f]">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanCard({ plan, isCurrent }) {
  return (
    <div className="flex flex-col rounded-[24px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
      <h3 className="text-xl font-bold text-[#163d34]">{plan.name}</h3>
      <p className="mt-1 text-2xl font-bold text-[#12372f]">
        {formatPrice(plan.price_cents, plan.billing_cycle)}
      </p>

      {plan.description && (
        <p className="mt-3 text-sm leading-6 text-[#5a6d66]">{plan.description}</p>
      )}

      {plan.seat_limit && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#78906f]">
          Up to {plan.seat_limit} seats
        </p>
      )}

      <BenefitList items={BENEFITS[plan.slug]} />

      {isCurrent ? (
        <div className="mt-auto pt-6">
          <span className="flex items-center justify-center rounded-full bg-[#dce8ca] px-5 py-2.5 text-sm font-semibold text-[#163d34]">
            Current plan
          </span>
        </div>
      ) : (
        <>
          <form action={startCheckout} className="mt-auto pt-6">
            <input type="hidden" name="planId" value={plan.id} />
            <button
              type="submit"
              className="w-full rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-[#84948d]">No lock-in — cancel anytime.</p>
        </>
      )}
    </div>
  );
}

function FreeCard({ hasSubscription }) {
  return (
    <div className="flex flex-col rounded-[24px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
      <h3 className="text-xl font-bold text-[#163d34]">Free</h3>
      <p className="mt-1 text-2xl font-bold text-[#12372f]">$0</p>
      <p className="mt-3 text-sm leading-6 text-[#5a6d66]">
        Explore MindSettle before you subscribe.
      </p>

      <BenefitList items={BENEFITS.free} />

      {hasSubscription ? (
        <div className="mt-auto pt-6">
          <span className="flex items-center justify-center rounded-full bg-[#f0f1ea] px-5 py-2.5 text-sm font-semibold text-[#6c8178]">
            Included with every account
          </span>
        </div>
      ) : (
        <form action={continueWithFreeAccess} className="mt-auto pt-6">
          <button
            type="submit"
            className="w-full rounded-full border border-[#163d34] px-5 py-2.5 text-sm font-semibold text-[#163d34] transition hover:bg-[#163d34] hover:text-white"
          >
            Continue Free
          </button>
        </form>
      )}
      <p className="mt-2 text-center text-xs text-[#84948d]">No card required.</p>
    </div>
  );
}
