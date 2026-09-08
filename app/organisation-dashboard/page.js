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
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#163d34] px-6 py-8 text-white shadow-[0_24px_60px_rgba(22,61,52,0.16)] sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[42px] border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-28 right-28 h-52 w-52 rounded-full bg-[#d7f2ad]/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7f2ad] ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7f2ad]" />
              Organisation workspace
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Welcome, {organisationName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              Manage your people, seats and wellbeing access from one calm, secure place.
            </p>
          </div>
          <div className="w-fit rounded-2xl bg-white/[0.08] px-4 py-3 ring-1 ring-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Signed in as</p>
            <p className="mt-1 max-w-64 truncate text-sm font-semibold text-white/90">{user.email}</p>
          </div>
        </div>
      </section>

      {checkout === "success" && (
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900">
          Checkout returned successfully. Your seat allowance will appear after payment confirmation has been received.
        </section>
      )}

      {hasActivePlan ? (
        <section className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#cadcb9] bg-[#eef5e7] px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm text-emerald-900">
            <span className="mr-2 inline-flex rounded-full bg-[#163d34] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#d7f2ad]">Active</span>
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
        <section className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
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

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active members" value={members.length} detail="Access ready" tone="green" />
        <StatCard label="Pending members" value={pending.length} detail="Awaiting setup" tone="amber" />
        <StatCard label="Purchased seats" value={seatLimit ?? "—"} detail={`${allocatedSeats} allocated`} tone="blue" />
      </section>

      <div className="mb-4 mt-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#78906f]">Quick actions</p>
        <h2 className="mt-1 text-xl font-semibold text-[#163d34]">What would you like to do?</h2>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

function StatCard({ label, value, detail, tone }) {
  const toneClasses = {
    green: "bg-[#e9f3e2] text-[#52724a]",
    amber: "bg-[#fff1dc] text-[#9b642c]",
    blue: "bg-[#e5efee] text-[#416b66]",
  };

  return (
    <div className="rounded-2xl border border-[#dfe5dc] bg-[#fffdfa] p-5 shadow-[0_10px_30px_rgba(18,55,47,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#6b7d76]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#163d34]">{value ?? 0}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClasses[tone]}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
        </span>
      </div>
      <p className="mt-4 border-t border-[#edf0eb] pt-3 text-xs font-medium text-[#8a9993]">{detail}</p>
    </div>
  );
}
