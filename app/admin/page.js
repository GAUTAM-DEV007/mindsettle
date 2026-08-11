import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addCategory, updateCategory, deleteCategory } from "./actions";

// proxy.js already redirects non-admins away from /admin, but Next.js
// recommends re-checking auth inside the route itself rather than
// relying on proxy alone (a matcher change could silently drop coverage).
// Also never statically render/cache this route -- it's auth-gated and
// its data is per-admin-session.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }) {
  const { categoryError } = await searchParams;

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

  const [{ data: stats, error: statsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase.rpc("admin_dashboard_analytics"),
      supabase.from("categories").select("id, name, slug").order("name"),
    ]);

  if (statsError) {
    throw new Error(statsError.message);
  }

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const {
    total_users,
    total_videos,
    subscriptions_by_status,
    most_watched_videos,
    most_favourited_videos,
    user_growth,
  } = stats;

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
          <h2 className="text-lg font-medium">User growth (last 30 days)</h2>
          <div className="mt-4 max-h-56 overflow-y-auto text-sm">
            <table className="w-full">
              <tbody>
                {user_growth.map((day) => (
                  <tr key={day.date} className="border-b border-neutral-100 last:border-0">
                    <td className="py-1.5 text-neutral-600">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-1.5 text-right font-medium">{day.new_users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <RankedVideoList
          title="Most watched videos"
          items={most_watched_videos}
          countKey="watch_count"
          emptyLabel="No watch history yet."
        />
        <RankedVideoList
          title="Most favourited videos"
          items={most_favourited_videos}
          countKey="favourite_count"
          emptyLabel="No favourites yet."
        />
      </section>

      <section className="mt-10 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Categories</h2>

        {categoryError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {categoryError}
          </p>
        )}

        <form
          action={addCategory}
          className="mt-4 flex flex-wrap items-end gap-3 border-b border-neutral-100 pb-6"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="new-name" className="text-xs font-medium text-neutral-600">
              Name
            </label>
            <input
              id="new-name"
              name="name"
              required
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="new-slug" className="text-xs font-medium text-neutral-600">
              Slug
            </label>
            <input
              id="new-slug"
              name="slug"
              required
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Add category
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          {categories.length === 0 ? (
            <p className="text-sm text-neutral-600">No categories yet.</p>
          ) : (
            categories.map((category) => (
              <form
                key={category.id}
                action={updateCategory}
                className="flex flex-wrap items-center gap-2"
              >
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  required
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  name="slug"
                  defaultValue={category.slug}
                  required
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="rounded-full border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  Save
                </button>
                <button
                  type="submit"
                  formAction={deleteCategory}
                  className="rounded-full px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            ))
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

function RankedVideoList({ title, items, countKey, emptyLabel }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600">{emptyLabel}</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-3 text-sm">
          {items.map((video, index) => (
            <li
              key={video.video_id}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-neutral-700">
                {index + 1}. {video.title}
              </span>
              <span className="shrink-0 font-medium text-emerald-700">
                {video[countKey]}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
