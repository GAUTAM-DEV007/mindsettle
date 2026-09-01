import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelMySubscription, openBillingPortal } from "./actions";
import CancelSubscriptionButton from "@/components/billing/CancelSubscriptionButton";

const STATUS_LABELS = { trialing: "Trial", active: "Active", past_due: "Payment due", canceled: "Cancelled", incomplete: "Incomplete" };

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }) {
  const { checkout, error: actionError } = searchParams ? await searchParams : {};

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("plan, status, seat_quantity, stripe_customer_id, current_period_end, updated_at, plans:subscription_plans(name, type, billing_cycle)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("We could not load your subscription details.");

  const isActive = subscription && ["active", "trialing"].includes(subscription.status);
  const planName = subscription?.plans?.name || subscription?.plan || "Mindsettle subscription";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">My MindSettle</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#163d34]">Billing</h1>
      </div>

      {checkout === "success" && (
        <div className="max-w-xl rounded-xl bg-[#dce8ca]/60 px-4 py-3 text-sm text-[#163d34]">
          Checkout returned successfully. Your plan will appear below once payment confirmation has been received.
        </div>
      )}

      {checkout === "trial-started" && (
        <div className="max-w-xl rounded-xl bg-[#dce8ca]/60 px-4 py-3 text-sm text-[#163d34]">
          Trial checkout returned successfully. Access starts once confirmation has been received; check your plan status below.
        </div>
      )}

      {actionError && (
        <div className="max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="max-w-xl rounded-[24px] border border-[#dfe5dc] bg-[#fffdfa] p-7 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
        {subscription ? (
          <>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-[#5a6d66]">Current plan</p>
                <p className="mt-1 text-xl font-bold text-[#163d34]">{planName}</p>
              </div>
              <span className="rounded-full bg-[#dce8ca] px-3 py-1 text-xs font-bold text-[#163d34]">
                {STATUS_LABELS[subscription.status] || subscription.status}
              </span>
            </div>

            {subscription.plans?.billing_cycle && (
              <p className="mt-3 text-sm capitalize text-[#5a6d66]">
                Billed {subscription.plans.billing_cycle}
              </p>
            )}

            {subscription.plans?.type === "organisation" && (
              <p className="mt-1 text-sm text-[#5a6d66]">
                {subscription.seat_quantity} purchased member seats. The organisation-admin account is included.
              </p>
            )}

            {subscription.current_period_end && (
              <p className="mt-1 text-sm text-[#5a6d66]">
                Current period ends{" "}
                {new Date(subscription.current_period_end).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                .
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/subscription"
                className="inline-flex rounded-full border border-[#163d34] px-5 py-2.5 text-sm font-semibold text-[#163d34] transition hover:bg-[#163d34] hover:text-white"
              >
                View plans
              </Link>

              {subscription.stripe_customer_id && (
                <form action={openBillingPortal}>
                  <button type="submit" className="inline-flex rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white">
                    Payment details and invoices
                  </button>
                </form>
              )}

              {isActive && (
                <form action={cancelMySubscription}>
                  <CancelSubscriptionButton />
                </form>
              )}
            </div>
            {isActive && <p className="mt-3 text-xs leading-5 text-[#5a6d66]">Cancelling here ends access immediately. For plan or organisation seat changes, contact billing support.</p>}
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-[#163d34]">You are currently using MindSettle Free</p>
            <p className="mt-2 text-sm leading-6 text-[#5a6d66]">
              Subscribe for full access to every session, or contact us if your
              organisation should already have access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/subscription"
                className="inline-flex rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
              >
                View plans
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-[#163d34] px-5 py-2.5 text-sm font-semibold text-[#163d34] transition hover:bg-[#163d34] hover:text-white"
              >
                Contact billing support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
