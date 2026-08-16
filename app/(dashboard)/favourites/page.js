import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { removeFavourite } from "@/lib/actions/favourites";
import VideoCard from "@/components/video/VideoCard";

async function createSignedStorageUrl(
  supabase,
  path,
  expiresIn = 3600
) {
  if (!path) {
    return null;
  }

  const { data, error } =
    await supabase.storage
      .from("videos")
      .createSignedUrl(
        path,
        expiresIn
      );

  if (error) {
    console.error(
      `Could not create signed URL for ${path}:`,
      error
    );

    return null;
  }

  return data?.signedUrl ?? null;
}

export default async function FavouritesPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const {
    data: favourites,
    error,
  } = await supabase
    .from("favourites")
    .select(
      `
      video_id,
      videos(
        id,
        title,
        description,
        instructor,
        duration_minutes,
        thumbnail_url,
        video_url,
        is_published,
        categories(
          id,
          name,
          slug
        )
      )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      error.message
    );
  }

  /*
   * Create signed thumbnail and preview
   * URLs because the videos bucket is
   * private.
   */
  const favouriteVideos =
    await Promise.all(
      (favourites || [])
        .map(
          ({ videos }) =>
            videos
        )
        .filter((video) => video?.is_published)
        .map(
          async (video) => {
            const [
              thumbnailUrl,
              previewUrl,
            ] =
              await Promise.all([
                createSignedStorageUrl(
                  supabase,
                  video.thumbnail_url,
                  3600
                ),

                createSignedStorageUrl(
                  supabase,
                  video.video_url,
                  1800
                ),
              ]);

            return {
              id: video.id,
              title: video.title,
              description:
                video.description,
              instructor:
                video.instructor,
              durationMinutes:
                video.duration_minutes,
              thumbnailUrl,
              previewUrl,
              category:
                video.categories ??
                null,
            };
          }
        )
    );

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          My MindSettle
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Your favourites
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Sessions you&apos;ve saved
          for later.
        </p>
      </div>

      {/* EMPTY STATE */}

      {favouriteVideos.length ===
      0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No favourites yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Browse the library and save
            sessions you&apos;d like to
            come back to.
          </p>

          <Link
            href="/library"
            className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            Browse Library
          </Link>
        </div>
      ) : (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favouriteVideos.map(
            (video) => (
              <div
                key={video.id}
                className="flex min-w-0 flex-col"
              >
                <VideoCard
                  video={
                    video
                  }
                />

                <form
                  action={
                    removeFavourite
                  }
                  className="mt-3"
                >
                  <input
                    type="hidden"
                    name="videoId"
                    value={video.id}
                  />

                  <input
                    type="hidden"
                    name="redirectPath"
                    value="/favourites"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    Remove from favourites
                  </button>
                </form>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
