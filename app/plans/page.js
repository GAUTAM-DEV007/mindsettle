import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startCheckout, continueWithFreeAccess } from "./actions";

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

export default async function PlansPage({ searchParams }) {
  const { error } = searchParams ? await searchParams : {};

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/plans");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isOrganisation = roleRecord?.role === "organisation";

  const { data: plans } = await supabase
    .from("plans")
    .select("id, type, name, description, price_cents, billing_cycle, seat_limit, tier, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_id")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const individualPlans = (plans || []).filter((p) => p.type === "individual");
  const organisationPlans = (plans || []).filter((p) => p.type === "organisation");

  return (
    <div className="min-h-screen bg-[#f5f5ed] px-6 py-16 text-[#29383e]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
            MindSettle plans
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#163d34] sm:text-4xl">
            Choose how you settle in.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5a6d66]">
            Subscribe for full access to every session, or continue with a
            handful of free videos to try MindSettle first.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-8 max-w-xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {subscription && (
          <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[#9bb98a] bg-[#dce8ca]/60 px-5 py-4 text-center text-sm font-semibold text-[#163d34]">
            You already have an active subscription.{" "}
            <Link href="/account/billing" className="underline">
              Manage billing
            </Link>
          </div>
        )}

        {/* INDIVIDUAL PLANS */}

        <section className="mt-12">
          <h2 className="text-lg font-bold text-[#163d34]">Individual</h2>
          <p className="mt-1 text-sm text-[#5a6d66]">For your own personal practice.</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {individualPlans.length === 0 && (
              <p className="text-sm text-[#6c8178]">No individual plans available yet.</p>
            )}

            {individualPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isCurrent={subscription?.plan_id === plan.id} />
            ))}
          </div>

          {!isOrganisation && (
            <form action={continueWithFreeAccess} className="mt-6 text-center">
              <button
                type="submit"
                className="text-sm font-semibold text-[#163d34] underline underline-offset-4 hover:text-[#12372f]"
              >
                Continue with free access
              </button>
            </form>
          )}
        </section>

        {/* ORGANISATION PLANS */}

        <section className="mt-14">
          <h2 className="text-lg font-bold text-[#163d34]">Organisation</h2>
          <p className="mt-1 text-sm text-[#5a6d66]">
            For hospitals, aged-care facilities, workplaces and other organisations.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {organisationPlans.length === 0 && (
              <p className="text-sm text-[#6c8178]">No organisation plans available yet.</p>
            )}

            {organisationPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isCurrent={subscription?.plan_id === plan.id} />
            ))}
          </div>
        </section>
      </div>
    </div>
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

      {isCurrent ? (
        <span className="mt-6 inline-flex items-center justify-center rounded-full bg-[#dce8ca] px-5 py-2.5 text-sm font-semibold text-[#163d34]">
          Current plan
        </span>
      ) : (
        <form action={startCheckout} className="mt-6">
          <input type="hidden" name="planId" value={plan.id} />
          <button
            type="submit"
            className="w-full rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
