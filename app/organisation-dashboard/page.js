import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// proxy.js already redirects non-organisation users away from
// /organisation-dashboard, but Next.js recommends re-checking auth inside
// the route itself rather than relying on proxy alone (a matcher change
// could silently drop coverage).
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

  // TODO: replace with real queries once organisation membership /
  // seat-management tables exist (e.g. organisation_members, invites).
  const memberCount = 0;
  const pendingInvites = 0;

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
        <StatCard label="Members" value={memberCount} />
        <StatCard label="Pending invites" value={pendingInvites} />
      </section>

      <section className="mt-10 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Members</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Member management isn&apos;t built yet. This is where the
          organisation will invite users and manage seats.
        </p>
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
