import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { removeFavourite } from "@/lib/actions/favourites";
import VideoCard from "@/components/video/VideoCard";
import { resolveCatalogueAccess } from "@/lib/access/entitlement";

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
        duration_seconds,
        thumbnail_url,
        video_url,
        is_published,
        is_premium,
        min_tier,
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

  const publishedFavourites =
    (favourites || [])
      .map(({ videos }) => videos)
      .filter((video) => video?.is_published);

  const favouritesAccess = await resolveCatalogueAccess(
    supabase,
    user,
    publishedFavourites
  );

  const favouriteVideos =
    await Promise.all(
      publishedFavourites.map(
        async (video) => {
          const videoAccess =
            favouritesAccess.get(video.id) ?? {
              allowed: false,
              requiresUpgrade: true,
            };

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

              videoAccess.allowed
                ? createSignedStorageUrl(
                    supabase,
                    video.video_url,
                    1800
                  )
                : Promise.resolve(null),
            ]);

          return {
            id: video.id,
            title:
              video.title,
            description:
              video.description,
            instructor:
              video.instructor,
            durationMinutes:
              video.duration_minutes,
            durationSeconds:
              video.duration_seconds,
            thumbnailUrl,
            previewUrl,
            category:
              video.categories ??
              null,
            locked: !videoAccess.allowed,
          };
        }
      )
    );

  return (
    <div className="relative flex flex-col gap-8 pb-10">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f5f5ed]" />

      <div className="pointer-events-none fixed left-0 top-24 -z-10 h-[300px] w-[300px] rounded-full bg-[#dce8ca]/35 blur-3xl" />

      {/* HEADER */}

      <section className="rounded-[28px] border border-[#cfd8cb] bg-[#fffdfa] px-6 py-7 shadow-[0_14px_38px_rgba(18,55,47,0.07)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
          My MindSettle
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#163d34] sm:text-4xl">
          Keep what helps close.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5a6d66] sm:text-base">
          Your saved sessions are here whenever you want
          to return to something familiar.
        </p>
      </section>

      {/* EMPTY STATE */}

      {favouriteVideos.length ===
      0 ? (
        <section className="rounded-[28px] border border-dashed border-[#cfd8cb] bg-[#fffdfa] px-6 py-14 text-center shadow-[0_8px_24px_rgba(18,55,47,0.04)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-xl text-[#163d34]">
            ♡
          </div>

          <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#163d34]">
            Nothing saved yet.
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a6d66]">
            Explore the library and save the sessions you
            would like to come back to later.
          </p>

          <Link
            href="/library"
            className="
              mt-6
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-full
              bg-[#163d34]
              px-6
              text-sm
              font-semibold
              text-white
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-[#12372f]

              focus:outline-none
              focus:ring-4
              focus:ring-[#dce8ca]
            "
          >
            Explore the library
          </Link>
        </section>
      ) : (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favouriteVideos.map(
            (video) => (
              <div
                key={video.id}
                className="
                  flex
                  min-w-0
                  flex-col
                  rounded-[24px]
                  border
                  border-[#dfe5dc]
                  bg-[#fafbf7]
                  p-3
                  shadow-[0_8px_24px_rgba(18,55,47,0.05)]
                "
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
                    value={
                      video.id
                    }
                  />

                  <input
                    type="hidden"
                    name="redirectPath"
                    value="/favourites"
                  />

                  <button
                    type="submit"
                    className="
                      w-full
                      rounded-full
                      border
                      border-[#cfd8cb]
                      bg-[#fffdfa]
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-[#5a6d66]
                      transition-all
                      duration-300

                      hover:border-[#9bb98a]
                      hover:bg-[#eef3e8]
                      hover:text-[#163d34]

                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#dce8ca]
                    "
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