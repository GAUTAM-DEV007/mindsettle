import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// proxy.js already redirects non-admins away from /admin, but Next.js
// recommends re-checking auth inside the route itself rather than
// relying on proxy alone (a matcher change could silently drop coverage).
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRecord?.role !== "admin") {
    redirect("/");
  }

  const { data: stats, error } = await supabase.rpc(
    "admin_dashboard_analytics"
  );

  if (error) {
    throw new Error(error.message);
  }

  const { total_users, total_videos, subscriptions_by_status, most_watched_videos } =
    stats;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-neutral-600">MindSettle platform analytics</p>
        </div>
        <Link href="/" className="text-sm text-emerald-700">
          Back to site
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Registered users" value={total_users} />
        <StatCard label="Videos" value={total_videos} />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium">Subscriptions by status</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatCard label="Active" value={subscriptions_by_status.active} compact />
            <StatCard label="Trialing" value={subscriptions_by_status.trialing} compact />
            <StatCard label="Canceled" value={subscriptions_by_status.canceled} compact />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-medium">Most watched videos</h2>
          {most_watched_videos.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600">No watch history yet.</p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3 text-sm">
              {most_watched_videos.map((video, index) => (
                <li
                  key={video.video_id}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-neutral-700">
                    {index + 1}. {video.title}
                  </span>
                  <span className="shrink-0 font-medium text-emerald-700">
                    {video.watch_count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, compact = false }) {
  return (
    <div className={`rounded-xl border border-neutral-200 ${compact ? "p-3" : "p-5"}`}>
      <p className="text-sm text-neutral-600">{label}</p>
      <p className={`mt-2 font-semibold ${compact ? "text-xl" : "text-3xl"}`}>
        {value ?? 0}
      </p>
    </div>
  );
}
