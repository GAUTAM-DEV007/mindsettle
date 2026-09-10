import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import ServiceUnavailable from "@/components/ui/ServiceUnavailable";

export const dynamic = "force-dynamic";

export default async function OrganisationReportsPage() {
  const supabase = await createClient();
  const { user } = await requireRole("organisation");

  const [{ data: members, error: memberError }, { data: subscription, error: subscriptionError }] =
    await Promise.all([
      supabase
        .from("organisation_members")
        .select("id, email, status, invited_at, onboarding_completed_at")
        .eq("organisation_id", user.id)
        .order("invited_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("seat_quantity, plans:subscription_plans(seat_limit)")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (memberError || subscriptionError) return <ServiceUnavailable subject="organisation report" />;

  const people = members ?? [];
  const activeCount = people.filter((member) => member.status === "active").length;
  const waitingCount = people.length - activeCount;
  const seatLimit = subscription?.seat_quantity ?? subscription?.plans?.seat_limit ?? null;
  const seatsRemaining = seatLimit === null ? null : Math.max(seatLimit - people.length, 0);
  const onboardingRate = people.length === 0 ? 0 : Math.round((activeCount / people.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Privacy-safe administration
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#163d34]">Access report</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Monitor purchased seats and account onboarding. Employees&apos; private wellbeing activity and viewing history are never shown here.
          </p>
        </div>
        <Link
          href="/organisation-dashboard/members"
          className="shrink-0 rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285c4f]"
        >
          Manage members →
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportStat label="Purchased seats" value={seatLimit ?? "—"} />
        <ReportStat label="Seats remaining" value={seatsRemaining ?? "—"} />
        <ReportStat label="Active members" value={activeCount} />
        <ReportStat label="Onboarding complete" value={`${onboardingRate}%`} />
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold text-[#163d34]">Recent member access</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {waitingCount} {waitingCount === 1 ? "person is" : "people are"} still completing setup.
          </p>
        </div>

        {people.length > 0 ? (
          <ul className="mt-5 divide-y divide-neutral-100">
            {people.slice(0, 10).map((member) => (
              <li key={member.id} className="flex min-w-0 flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 sm:flex-1">
                  <p className="[overflow-wrap:anywhere] text-sm font-medium text-neutral-800">{member.email}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Added {formatDate(member.invited_at)}</p>
                </div>
                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    member.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {member.status === "active" ? "Access active" : "Setup pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-5 text-sm text-neutral-600">
            No member seats have been allocated yet.
          </p>
        )}
      </section>
    </div>
  );
}

function ReportStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#163d34]">{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "recently";

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
