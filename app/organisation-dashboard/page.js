import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import ServiceUnavailable from "@/components/ui/ServiceUnavailable";

// Auth + role check happens in layout.js, which wraps this page.
export const dynamic = "force-dynamic";

export default async function OrganisationDashboardPage({ searchParams }) {
  const { checkout } = searchParams ? await searchParams : {};
  const supabase = await createClient();

  const { user } = await requireRole("organisation");

  const [{ data: allMembers, error: memberError }, { data: subscription, error: subscriptionError }] = await Promise.all([
    supabase
      .from("organisation_members")
      .select("id, status")
      .eq("organisation_id", user.id),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, seat_quantity, plans:subscription_plans(name, seat_limit)")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (memberError || subscriptionError) return <ServiceUnavailable subject="organisation account" />;

  const members = (allMembers ?? []).filter((m) => m.status === "active");
  const pending = (allMembers ?? []).filter((m) => m.status !== "active");
  const hasActivePlan = Boolean(subscription);
  const seatLimit = subscription?.seat_quantity ?? subscription?.plans?.seat_limit ?? null;
  const allocatedSeats = (allMembers ?? []).length;
  const organisationName = user.user_metadata?.organisation_name || "Your organisation";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">Organisation admin</p>
        <h1 className="mt-1 text-2xl font-semibold">{organisationName}</h1>
        <p className="mt-1 text-neutral-600">Signed in as {user.email}</p>
      </div>

      {checkout === "success" && (
        <section className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900">
          Checkout returned successfully. Your seat allowance will appear after payment confirmation has been received.
        </section>
      )}

      {hasActivePlan ? (
        <section className="mb-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-emerald-900">
            Plan: <span className="font-semibold">{subscription.plans?.name ?? "Organisation"}</span>
            {seatLimit && (
              <>
                {" "}· {allocatedSeats}/{seatLimit} seats allocated
              </>
            )}
          </p>
          <Link href="/account/billing" className="shrink-0 text-sm font-semibold text-emerald-800 underline">
            Manage billing
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
        <StatCard label="Active members" value={members.length} />
        <StatCard label="Pending members" value={pending.length} />
        <StatCard label="Purchased seats" value={seatLimit ?? "—"} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          href="/organisation-dashboard/members"
          eyebrow="Team access"
          title="Invite and manage members"
          description="Create member logins, monitor onboarding, and keep seats within your purchased limit."
        />
        <ActionCard
          href="/dashboard"
          eyebrow="For you"
          title="Open your wellbeing space"
          description="Organisation admins can also use Mindsettle sessions and programs themselves."
        />
        <ActionCard
          href="/account/billing"
          eyebrow="Plan and seats"
          title="Manage subscription"
          description="Review your plan, selected seat count, pricing, and billing details."
        />
      </section>
    </div>
  );
}

function ActionCard({ href, eyebrow, title, description }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-3 text-lg font-semibold text-[#163d34]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
      <p className="mt-5 text-sm font-semibold text-emerald-700 transition group-hover:translate-x-1">Open →</p>
    </Link>
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
