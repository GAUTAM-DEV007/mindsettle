import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cancelMySubscription } from "./actions";

const STATUS_LABELS = { trialing: "Trial", active: "Active", past_due: "Payment due", canceled: "Cancelled", incomplete: "Incomplete" };

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }) {
  const { checkout, error: actionError } = searchParams ? await searchParams : {};

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, updated_at, plans:subscription_plans(name, billing_cycle)")
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
        <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">My Mindsettle</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Billing</h1>
      </div>

      {checkout === "success" && (
        <div className="max-w-xl rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Subscription confirmed. Welcome to MindSettle Premium.
        </div>
      )}

      {actionError && (
        <div className="max-w-xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        {subscription ? (
          <>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm text-slate-500">Current plan</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{planName}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {STATUS_LABELS[subscription.status] || subscription.status}
              </span>
            </div>

            {subscription.plans?.billing_cycle && (
              <p className="mt-3 text-sm text-slate-600 capitalize">
                Billed {subscription.plans.billing_cycle}
              </p>
            )}

            {subscription.current_period_end && (
              <p className="mt-1 text-sm text-slate-600">
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
                className="inline-flex rounded-full border border-emerald-700 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                {isActive ? "Change plan" : "View plans"}
              </Link>

              {isActive && (
                <form action={cancelMySubscription}>
                  <button
                    type="submit"
                    className="inline-flex rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Cancel subscription
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-slate-950">You are currently using MindSettle Free</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Subscribe for full access to every session, or contact us if your
              organisation should already have access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/subscription"
                className="inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                View plans
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-emerald-700 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
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
