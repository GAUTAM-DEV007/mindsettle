import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddMemberForm from "./AddMemberForm";
import { removeMember } from "./actions";

// proxy.js already redirects non-organisation users away from
// /organisation-dashboard, but Next.js recommends re-checking auth inside
// the route itself rather than relying on proxy alone (a matcher change
// could silently drop coverage). Also never statically render/cache this
// route -- it's auth-gated and its data is per-session.
export const dynamic = "force-dynamic";

export default async function OrganisationDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "organisation") {
    redirect("/");
  }

  const { data: allMembers } = await supabase
    .from("organisation_members")
    .select("id, email, status, invited_at")
    .eq("organisation_id", user.id)
    .order("invited_at", { ascending: false });

  const members = (allMembers ?? []).filter((m) => m.status === "active");
  const pending = (allMembers ?? []).filter((m) => m.status === "pending");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organisation dashboard</h1>
          <p className="mt-1 text-neutral-600">
            Signed in as {user.email}
          </p>
        </div>
        <Link href="/" className="text-sm text-emerald-700">
          Back to site
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Members" value={members.length} />
        <StatCard label="Pending members" value={pending.length} />
      </section>

      <section className="mt-10 rounded-xl border border-neutral-200 p-6">
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-5">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>
    </div>
  );
}
