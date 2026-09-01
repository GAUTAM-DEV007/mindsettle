import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import ServiceUnavailable from "@/components/ui/ServiceUnavailable";
import AddMemberForm from "../AddMemberForm";
import { removeMember } from "../actions";

// Auth + role check happens in ../layout.js.
export const dynamic = "force-dynamic";

export default async function OrganisationMembersPage() {
  const supabase = await createClient();

  const { user } = await requireRole("organisation");

  const [{ data: allMembers, error: memberError }, { data: subscription, error: subscriptionError }] = await Promise.all([
    supabase
      .from("organisation_members")
      .select("id, email, status, invited_at, temporary_password_issued_at, onboarding_completed_at")
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

  if (memberError || subscriptionError) return <ServiceUnavailable subject="organisation members" />;

  const members = (allMembers ?? []).filter((m) => m.status === "active");
  const invited = (allMembers ?? []).filter((m) => m.status === "invited");
  const pending = (allMembers ?? []).filter((m) => m.status === "pending");
  const allocatedSeats = (allMembers ?? []).length;
  const seatLimit = subscription?.seat_quantity ?? subscription?.plans?.seat_limit ?? null;
  const seatsRemaining = seatLimit === null ? 0 : Math.max(seatLimit - allocatedSeats, 0);
  const canAddMember = Boolean(subscription) && seatsRemaining > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="mt-1 text-neutral-600">
          {members.length} active, {invited.length + pending.length} awaiting access · {allocatedSeats}/{seatLimit ?? "—"} seats allocated.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Add a member</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Create a teammate&apos;s login and reserve one seat. New members receive a temporary password and must replace it before their dashboard opens. Existing Mindsettle users keep their current password.
        </p>
        {!subscription && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Buy an organisation seat plan before adding members.
          </p>
        )}
        {subscription && seatsRemaining === 0 && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            All purchased seats are allocated. Remove an invitation or contact support to increase your seats.
          </p>
        )}
        <div className="mt-4">
          <AddMemberForm disabled={!canAddMember} />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <MemberList title="Active members" people={members} emptyText="No active members yet." />
        <MemberList
          title="Awaiting password change"
          people={[...invited, ...pending]}
          emptyText="No members are waiting to finish setup."
        />
      </section>
    </div>
  );
}

function MemberList({ title, people, emptyText }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {people.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600">{emptyText}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-neutral-700">{person.email}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {person.status === "active" ? "Access active" : "Seat reserved · setup not finished"}
                </p>
              </div>
              <form action={removeMember.bind(null, person.id)}>
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
