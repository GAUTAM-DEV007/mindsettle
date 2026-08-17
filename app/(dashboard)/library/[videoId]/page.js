import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  addFavourite,
  removeFavourite,
} from "@/lib/actions/favourites";

import VideoPlayer from "@/components/video/VideoPlayer";
import HorizontalVideoRow from "@/components/video/HorizontalVideoRow";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createSignedStorageUrl(
  supabase,
  path,
  label
) {
  if (!path) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from("videos")
    .createSignedUrl(path, 3600);

  if (error) {
    console.error(
      `Could not create signed ${label} URL:`,
      error
    );

    return null;
  }

  return data?.signedUrl ?? null;
}

async function prepareRecommendation(
  supabase,
  recommendation
) {
  const [
    thumbnailUrl,
    src,
  ] = await Promise.all([
    createSignedStorageUrl(
      supabase,
      recommendation.thumbnail_url,
      "recommendation thumbnail"
    ),

    createSignedStorageUrl(
      supabase,
      recommendation.video_url,
      "recommendation video"
    ),
  ]);

  return {
    id: recommendation.id,
    title: recommendation.title,
    instructor: recommendation.instructor,
    durationMinutes:
      recommendation.duration_minutes,
    thumbnailUrl,
    src,
    categoryId:
      recommendation.category_id ?? null,
    createdAt:
      recommendation.created_at,
  };
}

export default async function VideoPage({
  params,
}) {
  const { videoId } = await params;

  const supabase =
    await createClient();

  const isRealVideo =
    UUID_RE.test(videoId);

  let video = null;

  let isFavourited = false;

  let recommendations = [];

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (isRealVideo) {
    const {
      data,
      error,
    } =
      await supabase
        .from("videos")
        .select(`
          id,
          title,
          description,
          instructor,
          duration_minutes,
          thumbnail_url,
          video_url,
          category_id,
          created_at,
          categories(
            id,
            name,
            slug
          )
        `)
        .eq("id", videoId)
        .eq("is_published", true)
        .single();

    if (error) {
      console.error(
        "Failed to load video:",
        error
      );
    }

    if (data) {
      const [
        signedVideoUrl,
        signedThumbnailUrl,
      ] =
        await Promise.all([
          createSignedStorageUrl(
            supabase,
            data.video_url,
            "video"
          ),

          createSignedStorageUrl(
            supabase,
            data.thumbnail_url,
            "thumbnail"
          ),
        ]);

      video = {
        id: data.id,
        title: data.title,
        description:
          data.description,
        instructor:
          data.instructor,
        durationMinutes:
          data.duration_minutes,
        thumbnailUrl:
          signedThumbnailUrl,
        src:
          signedVideoUrl,
        categoryId:
          data.category_id,
        category:
          data.categories?.name ??
          null,
        createdAt:
          data.created_at,
      };

      let recommendationQuery =
        supabase
          .from("videos")
          .select(`
            id,
            title,
            instructor,
            duration_minutes,
            thumbnail_url,
            video_url,
            category_id,
            created_at
          `)
          .eq("is_published", true)
          .neq("id", videoId)
          .order("created_at", {
            ascending: false,
          })
          .limit(10);

      if (data.category_id) {
        recommendationQuery =
          recommendationQuery.eq(
            "category_id",
            data.category_id
          );
      }

      const {
        data:
          recommendationData,
        error:
          recommendationError,
      } =
        await recommendationQuery;

      if (
        recommendationError
      ) {
        console.error(
          "Could not load recommendations:",
          recommendationError
        );
      }

      if (
        recommendationData
      ) {
        recommendations =
          await Promise.all(
            recommendationData.map(
              (
                recommendation
              ) =>
                prepareRecommendation(
                  supabase,
                  recommendation
                )
            )
          );
      }

      if (
        recommendations.length ===
        0
      ) {
        const {
          data:
            otherVideos,
          error:
            otherVideosError,
        } =
          await supabase
            .from("videos")
            .select(`
              id,
              title,
              instructor,
              duration_minutes,
              thumbnail_url,
              video_url,
              category_id,
              created_at
            `)
            .eq("is_published", true)
            .neq("id", videoId)
            .order("created_at", {
              ascending: false,
            })
            .limit(10);

        if (
          otherVideosError
        ) {
          console.error(
            "Could not load other videos:",
            otherVideosError
          );
        }

        if (
          otherVideos
        ) {
          recommendations =
            await Promise.all(
              otherVideos.map(
                (
                  recommendation
                ) =>
                  prepareRecommendation(
                    supabase,
                    recommendation
                  )
              )
            );
        }
      }
    }

    if (
      video &&
      user
    ) {
      const {
        data:
          favourite,
      } =
        await supabase
          .from(
            "favourites"
          )
          .select("id")
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "video_id",
            videoId
          )
          .maybeSingle();

      isFavourited =
        Boolean(
          favourite
        );
    }
  }

  if (!video) {
    notFound();
  }

  const playerPlaylist =
    recommendations
      .filter((item) =>
        Boolean(item.src)
      )
      .map(
        (item) => ({
          id:
            item.id,
          src:
            item.src,
          poster:
            item.thumbnailUrl,
          title:
            item.title,
          instructor:
            item.instructor,
          durationMinutes:
            item.durationMinutes,
        })
      );

  const redirectPath =
    `/library/${videoId}`;

  return (
    <div className="relative space-y-12 pb-16">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f5f5ed]" />

      <div className="pointer-events-none fixed -right-24 top-32 -z-10 h-[320px] w-[320px] rounded-full bg-[#dce8ca]/35 blur-3xl" />

      {/* PLAYER + DETAILS */}

      <section className="mx-auto w-full max-w-6xl">
        {video.src ? (
          <div className="overflow-hidden rounded-[28px] shadow-[0_18px_44px_rgba(18,55,47,0.14)]">
            <VideoPlayer
              key={
                video.id
              }
              initialMedia={{
                id:
                  video.id,

                src:
                  video.src,

                poster:
                  video.thumbnailUrl,

                title:
                  video.title,

                instructor:
                  video.instructor,

                durationMinutes:
                  video.durationMinutes,
              }}
              playlist={
                playerPlaylist
              }
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-[28px] bg-[#12372f] px-6 text-center text-sm text-white/75 shadow-[0_18px_44px_rgba(18,55,47,0.16)]">
            This session does not currently
            have a playable media file.
          </div>
        )}

        {/* VIDEO INFORMATION */}

        <div className="mt-7 rounded-[28px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
                MindSettle session
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#163d34] sm:text-4xl">
                {
                  video.title
                }
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-[#5a6d66]">
                <span>
                  {video.instructor ||
                    "MindSettle"}
                </span>

                {video.durationMinutes && (
                  <>
                    <span className="text-[#9aa9a2]">
                      •
                    </span>

                    <span>
                      {
                        video.durationMinutes
                      }{" "}
                      min
                    </span>
                  </>
                )}

                {video.category && (
                  <>
                    <span className="text-[#9aa9a2]">
                      •
                    </span>

                    <span className="rounded-full bg-[#dce8ca] px-3 py-1 text-xs font-semibold text-[#163d34]">
                      {
                        video.category
                      }
                    </span>
                  </>
                )}
              </div>
            </div>

            {isRealVideo &&
              user && (
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
                    value={
                      video.id
                    }
                  />

                  <input
                    type="hidden"
                    name="redirectPath"
                    value={
                      redirectPath
                    }
                  />

                  <button
                    type="submit"
                    className={`shrink-0 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                      isFavourited
                        ? "bg-[#163d34] text-white shadow-[0_8px_20px_rgba(18,55,47,0.16)] hover:bg-[#12372f]"
                        : "border border-[#9bb98a] bg-[#fffdfa] text-[#163d34] hover:bg-[#eef3e8]"
                    }`}
                  >
                    {isFavourited
                      ? "♥ Saved"
                      : "♡ Save"}
                  </button>
                </form>
              )}
          </div>

          {video.description && (
            <div className="mt-7 border-t border-[#dfe5dc] pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
                About this session
              </h2>

              <p className="mt-3 max-w-4xl whitespace-pre-wrap text-base leading-7 text-[#5a6d66]">
                {
                  video.description
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MORE LIKE THIS */}

      {recommendations.length >
        0 && (
        <section className="min-w-0">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
              Keep exploring
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#163d34]">
              More like this
            </h2>

            <p className="mt-1 text-sm text-[#5a6d66]">
              More MindSettle sessions that
              may suit this moment.
            </p>
          </div>

          <HorizontalVideoRow
            videos={
              recommendations
            }
          />
        </section>
      )}

      {/* BACK TO LIBRARY */}

      <section>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 rounded-full border border-[#cfd8cb] bg-[#fffdfa] px-5 py-2.5 text-sm font-semibold text-[#163d34] shadow-[0_6px_18px_rgba(18,55,47,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#9bb98a] hover:bg-[#eef3e8]"
        >
          ← Back to library
        </Link>
      </section>
    </div>
  );
}