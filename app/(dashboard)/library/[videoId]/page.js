import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoById } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";
import {
  addFavourite,
  removeFavourite,
} from "@/lib/actions/favourites";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoCard from "@/components/video/VideoCard";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createSignedThumbnail(supabase, path) {
  if (!path) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(path, 3600);

  if (error) {
    console.error(
      "Could not create recommendation thumbnail:",
      error
    );

    return null;
  }

  return data?.signedUrl ?? null;
}

export default async function VideoPage({ params }) {
  const { videoId } = await params;

  const supabase = await createClient();

  const isRealVideo = UUID_RE.test(videoId);

  let video = null;
  let isFavourited = false;
  let recommendations = [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * --------------------------------
   * REAL SUPABASE VIDEO
   * --------------------------------
   */

  if (isRealVideo) {
    const { data, error } = await supabase
      .from("videos")
      .select(
        `
        id,
        title,
        description,
        instructor,
        duration_minutes,
        thumbnail_url,
        video_url,
        category_id,
        categories(
          id,
          name,
          slug
        )
        `
      )
      .eq("id", videoId)
      .single();

    if (error) {
      console.error("Failed to load video:", error);
    }

    if (data) {
      let signedVideoUrl = null;
      let signedThumbnailUrl = null;

      /*
       * Create temporary secure URL
       * for the private video.
       */

      if (data.video_url) {
        const {
          data: signedVideo,
          error: videoUrlError,
        } = await supabase.storage
          .from("videos")
          .createSignedUrl(data.video_url, 3600);

        if (videoUrlError) {
          console.error(
            "Could not create signed video URL:",
            videoUrlError
          );
        } else {
          signedVideoUrl =
            signedVideo?.signedUrl ?? null;
        }
      }

      /*
       * Create temporary secure URL
       * for the private thumbnail.
       */

      if (data.thumbnail_url) {
        const {
          data: signedThumbnail,
          error: thumbnailUrlError,
        } = await supabase.storage
          .from("videos")
          .createSignedUrl(data.thumbnail_url, 3600);

        if (thumbnailUrlError) {
          console.error(
            "Could not create signed thumbnail URL:",
            thumbnailUrlError
          );
        } else {
          signedThumbnailUrl =
            signedThumbnail?.signedUrl ?? null;
        }
      }

      video = {
        id: data.id,
        title: data.title,
        description: data.description,
        instructor: data.instructor,
        durationMinutes: data.duration_minutes,
        thumbnailUrl: signedThumbnailUrl,
        src: signedVideoUrl,
        categoryId: data.category_id,
        category: data.categories?.name ?? null,
      };

      /*
       * --------------------------------
       * SAME-CATEGORY RECOMMENDATIONS
       * --------------------------------
       */

      let recommendationQuery = supabase
        .from("videos")
        .select(
          `
          id,
          title,
          instructor,
          duration_minutes,
          thumbnail_url,
          category_id
          `
        )
        .neq("id", videoId)
        .limit(10);

      if (data.category_id) {
        recommendationQuery =
          recommendationQuery.eq(
            "category_id",
            data.category_id
          );
      }

      const {
        data: recommendationData,
        error: recommendationError,
      } = await recommendationQuery;

      if (recommendationError) {
        console.error(
          "Could not load recommendations:",
          recommendationError
        );
      }

      if (recommendationData) {
        recommendations = await Promise.all(
          recommendationData.map(
            async (recommendation) => ({
              id: recommendation.id,
              title: recommendation.title,
              instructor: recommendation.instructor,
              durationMinutes:
                recommendation.duration_minutes,
              thumbnailUrl:
                await createSignedThumbnail(
                  supabase,
                  recommendation.thumbnail_url
                ),
            })
          )
        );
      }

      /*
       * If there are no other videos in
       * this category, show recently added
       * videos instead.
       */

      if (recommendations.length === 0) {
        const {
          data: otherVideos,
          error: otherVideosError,
        } = await supabase
          .from("videos")
          .select(
            `
            id,
            title,
            instructor,
            duration_minutes,
            thumbnail_url
            `
          )
          .neq("id", videoId)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

        if (otherVideosError) {
          console.error(
            "Could not load other videos:",
            otherVideosError
          );
        }

        if (otherVideos) {
          recommendations = await Promise.all(
            otherVideos.map(
              async (recommendation) => ({
                id: recommendation.id,
                title: recommendation.title,
                instructor: recommendation.instructor,
                durationMinutes:
                  recommendation.duration_minutes,
                thumbnailUrl:
                  await createSignedThumbnail(
                    supabase,
                    recommendation.thumbnail_url
                  ),
              })
            )
          );
        }
      }
    }

    /*
     * --------------------------------
     * FAVOURITE STATUS
     * --------------------------------
     */

    if (video && user) {
      const { data: favourite } = await supabase
        .from("favourites")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      isFavourited = Boolean(favourite);
    }
  } else {
    /*
     * Keep supporting the original
     * static/program video catalogue.
     */

    video = getVideoById(videoId);
  }

  if (!video) {
    notFound();
  }

  const redirectPath = `/library/${videoId}`;

  return (
    <div className="space-y-12 pb-16">
      {/* VIDEO PLAYER */}

      <section className="mx-auto w-full max-w-6xl">
        {video.src ? (
          <VideoPlayer
            src={video.src}
            poster={video.thumbnailUrl}
            title={video.title}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-slate-950 px-6 text-center text-sm text-slate-300 shadow-xl">
            This video does not currently have a
            playable media file.
          </div>
        )}

        {/* VIDEO INFORMATION */}

        <div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {video.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                <span>
                  {video.instructor || "MindSettle"}
                </span>

                {video.durationMinutes && (
                  <>
                    <span>•</span>

                    <span>
                      {video.durationMinutes} min
                    </span>
                  </>
                )}

                {video.category && (
                  <>
                    <span>•</span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                      {video.category}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* SAVE BUTTON */}

            {isRealVideo && user && (
              <form
                action={
                  isFavourited
                    ? removeFavourite
                    : addFavourite
                }
              >
                <input
                  type="hidden"
                  name="videoId"
                  value={video.id}
                />

                <input
                  type="hidden"
                  name="redirectPath"
                  value={redirectPath}
                />

                <button
                  type="submit"
                  className={`shrink-0 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition ${
                    isFavourited
                      ? "bg-emerald-700 text-white hover:bg-emerald-600"
                      : "border-2 border-emerald-700 bg-white text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  {isFavourited
                    ? "♥ Saved"
                    : "♡ Save"}
                </button>
              </form>
            )}
          </div>

          {/* DESCRIPTION */}

          {video.description && (
            <div className="mt-7 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                About this session
              </h2>

              <p className="mt-3 max-w-4xl whitespace-pre-wrap text-base leading-7 text-slate-600">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RECOMMENDATIONS */}

      {recommendations.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              More Like This
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              More MindSettle sessions you may enjoy.
            </p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-5">
            {recommendations.map(
              (recommendation) => (
                <div
                  key={recommendation.id}
                  className="w-72 shrink-0"
                >
                  <VideoCard
                    video={recommendation}
                  />
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* BACK TO LIBRARY */}

      <section>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-600"
        >
          ← Back to Library
        </Link>
      </section>
    </div>
  );
}