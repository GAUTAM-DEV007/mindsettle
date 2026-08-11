import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VideoCard from "@/components/video/VideoCard";

export default async function LibraryPage({
  searchParams,
}) {
  const { q = "", category = "" } =
    await searchParams;

  const supabase = await createClient();

  const { data: categories } =
    await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

  // Embedded-resource filters only narrow
  // parent rows when !inner is used.
  let videosQuery = supabase
    .from("videos")
    .select(
      category
        ? "id, title, instructor, duration_minutes, thumbnail_url, categories!inner(id, name, slug)"
        : "id, title, instructor, duration_minutes, thumbnail_url, categories(id, name, slug)"
    )
    .order("created_at", {
      ascending: false,
    });

  if (q) {
    videosQuery = videosQuery.ilike(
      "title",
      `%${q}%`
    );
  }

  if (category) {
    videosQuery = videosQuery.eq(
      "categories.slug",
      category
    );
  }

  const {
    data: videos,
    error,
  } = await videosQuery;

  if (error) {
    throw new Error(error.message);
  }

  /*
   * The storage bucket is private.
   *
   * thumbnail_url contains only the storage
   * path, for example:
   *
   * thumbnails/example-thumbnail.jpg
   *
   * Create a temporary signed URL before
   * sending the thumbnail to VideoCard.
   */
  const videosWithSignedThumbnails =
    await Promise.all(
      (videos || []).map(
        async (video) => {
          let signedThumbnailUrl = null;

          if (video.thumbnail_url) {
            const {
              data: signedThumbnail,
              error: thumbnailError,
            } = await supabase.storage
              .from("videos")
              .createSignedUrl(
                video.thumbnail_url,
                3600
              );

            if (thumbnailError) {
              console.error(
                `Could not create thumbnail URL for video ${video.id}:`,
                thumbnailError
              );
            } else {
              signedThumbnailUrl =
                signedThumbnail?.signedUrl ??
                null;
            }
          }

          return {
            ...video,
            signedThumbnailUrl,
          };
        }
      )
    );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        Video library
      </h1>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="q"
            className="text-xs font-medium text-neutral-600"
          >
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
          <label
            htmlFor="category"
            className="text-xs font-medium text-neutral-600"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            defaultValue={category}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">
              All categories
            </option>

            {categories?.map(
              (categoryItem) => (
                <option
                  key={categoryItem.id}
                  value={categoryItem.slug}
                >
                  {categoryItem.name}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Search
        </button>

        {(q || category) && (
          <Link
            href="/library"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Clear
          </Link>
        )}
      </form>

      {videosWithSignedThumbnails.length ===
      0 ? (
        <p className="text-sm text-neutral-600">
          No videos match your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videosWithSignedThumbnails.map(
            (video) => (
              <VideoCard
                key={video.id}
                video={{
                  id: video.id,
                  title: video.title,
                  instructor:
                    video.instructor,
                  durationMinutes:
                    video.duration_minutes,

                  // IMPORTANT:
                  // Send the signed URL,
                  // not the private storage path.
                  thumbnailUrl:
                    video.signedThumbnailUrl,
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}