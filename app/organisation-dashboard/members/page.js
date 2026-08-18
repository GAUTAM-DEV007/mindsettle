import { createClient } from "@/lib/supabase/server";
import AddMemberForm from "../AddMemberForm";
import { removeMember } from "../actions";

// Auth + role check happens in ../layout.js.
export const dynamic = "force-dynamic";

export default async function OrganisationMembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: allMembers } = await supabase
    .from("organisation_members")
    .select("id, email, status, invited_at")
    .eq("organisation_id", user.id)
    .order("invited_at", { ascending: false });

  const members = (allMembers ?? []).filter((m) => m.status === "active");
  const pending = (allMembers ?? []).filter((m) => m.status === "pending");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="mt-1 text-neutral-600">
          {members.length} active, {pending.length} pending.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Add a member</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Add a teammate&apos;s email. They&apos;ll become active automatically
          when they sign up with that address. This does not send an email.
        </p>
        <div className="mt-4">
          <AddMemberForm />
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <MemberList title="Members" people={members} emptyText="No members yet." />
        <MemberList
          title="Pending members"
          people={pending}
          emptyText="No pending members."
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
              <span className="text-neutral-700">{person.email}</span>
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
