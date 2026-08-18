import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Auth + role check happens in layout.js, which wraps this page.
export const dynamic = "force-dynamic";

export default async function OrganisationDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: allMembers }, { data: subscription }] = await Promise.all([
    supabase
      .from("organisation_members")
      .select("id, status")
      .eq("organisation_id", user.id),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, plans:subscription_plans(name, seat_limit)")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle(),
  ]);

  const members = (allMembers ?? []).filter((m) => m.status === "active");
  const pending = (allMembers ?? []).filter((m) => m.status === "pending");
  const hasActivePlan = Boolean(subscription);
  const seatLimit = subscription?.plans?.seat_limit ?? null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Organisation dashboard</h1>
        <p className="mt-1 text-neutral-600">Signed in as {user.email}</p>
      </div>

      {hasActivePlan ? (
        <section className="mb-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-emerald-900">
            Plan: <span className="font-semibold">{subscription.plans?.name ?? "Organisation"}</span>
            {seatLimit && (
              <>
                {" "}· {members.length}/{seatLimit} seats used
              </>
            )}
          </p>
          <Link href="/subscription" className="shrink-0 text-sm font-semibold text-emerald-800 underline">
            Change plan
          </Link>
        </section>
      ) : (
        <section className="mb-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-amber-900">
            No active organisation plan. Members won&apos;t get organisation content access until you subscribe.
          </p>
          <Link
            href="/subscription"
            className="shrink-0 rounded-full bg-[#163d34] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#12372f]"
          >
            View plans
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={members.length} />
        <StatCard label="Pending members" value={pending.length} />
        <StatCard label="Seat limit" value={seatLimit ?? "—"} />
      </section>

      <section className="mt-8 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Manage your organisation</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Add or remove members, and keep an eye on how many seats you have left.
        </p>
        <Link
          href="/organisation-dashboard/members"
          className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Go to Members →
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-5">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>
    </div>
  );
}
