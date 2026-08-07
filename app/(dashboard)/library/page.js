import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VideoCard from "@/components/video/VideoCard";

export default async function LibraryPage({ searchParams }) {
  const { q = "", category = "" } = await searchParams;

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  // Embedded-resource filters (categories.slug) only narrow the parent
  // rows when the join is forced with !inner; a plain embed just nests
  // the related row without excluding videos that don't match.
  let videosQuery = supabase
    .from("videos")
    .select(
      category
        ? "id, title, instructor, duration_minutes, thumbnail_url, categories!inner(id, name, slug)"
        : "id, title, instructor, duration_minutes, thumbnail_url, categories(id, name, slug)"
    )
    .order("created_at", { ascending: false });

  if (q) {
    videosQuery = videosQuery.ilike("title", `%${q}%`);
  }

  if (category) {
    videosQuery = videosQuery.eq("categories.slug", category);
  }

  const { data: videos, error } = await videosQuery;

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Video library</h1>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs font-medium text-neutral-600">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by title..."
            className="w-56 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-xs font-medium text-neutral-600">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Search
        </button>

        {(q || category) && (
          <Link href="/library" className="text-sm text-neutral-600 hover:text-neutral-900">
            Clear
          </Link>
        )}
      </form>

      {videos.length === 0 ? (
        <p className="text-sm text-neutral-600">No videos match your search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={{
                id: video.id,
                title: video.title,
                instructor: video.instructor,
                durationMinutes: video.duration_minutes,
                thumbnailUrl: video.thumbnail_url,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
