import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  addFavourite,
  removeFavourite,
} from "@/lib/actions/favourites";

import CinematicMediaHero from "@/components/video/CinematicMediaHero";
import MediaDetailModal from "@/components/video/MediaDetailModal";
import HorizontalVideoRow from "@/components/video/HorizontalVideoRow";
import { resolveVideoAccess } from "@/lib/access/entitlement";

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
          min_tier,
          is_premium,
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
      // Check entitlement before ever asking storage for a signed URL --
      // opening this page is the actual "watch" action, so this is also
      // where a free view gets recorded against the 3-video allowance.
      const access = await resolveVideoAccess(supabase, user, data, {
        recordView: true,
      });

      const [
        signedVideoUrl,
        signedThumbnailUrl,
      ] =
        await Promise.all([
          access.allowed
            ? createSignedStorageUrl(
                supabase,
                data.video_url,
                "video"
              )
            : Promise.resolve(null),

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
        locked: !access.allowed,
        requiresLogin: access.requiresLogin,
        requiresUpgrade: access.requiresUpgrade,
        freeViewsRemaining: access.freeViewsRemaining,
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
    <MediaDetailModal>
      <div className="relative space-y-10 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(213,228,202,0.72),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(206,223,203,0.58),transparent_34%),linear-gradient(180deg,#f5f5ed_0%,#edf3e8_48%,#e6eee4_100%)] px-0 pb-10 pt-0 text-[#29443c]">
      {/* BACKGROUND */}

      <div className="hidden" />

      <div className="hidden" />

      {/* PLAYER + DETAILS */}

      <section className="mx-auto w-full max-w-6xl">
        {video.src ? (
          <CinematicMediaHero
            video={video}
            playlist={playerPlaylist}
          />
        ) : video.locked ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-[28px] bg-[#12372f] px-6 text-center shadow-[0_18px_44px_rgba(18,55,47,0.16)]">
            <p className="text-sm text-white/75">
              {video.requiresUpgrade
                ? "This session needs a MindSettle subscription."
                : "Sign in to watch this session."}
            </p>

            <Link
              href={
                video.requiresUpgrade
                  ? "/subscription"
                  : "/login"
              }
              className="rounded-full bg-[#d7f2ad] px-6 py-3 text-sm font-semibold text-[#12372f] shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              {video.requiresUpgrade
                ? "View plans"
                : "Log in"}
            </Link>
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-[28px] bg-[#12372f] px-6 text-center text-sm text-white/75 shadow-[0_18px_44px_rgba(18,55,47,0.16)]">
            This session does not currently have a playable media file.
          </div>
        )}

      </section>

      {/* MORE LIKE THIS */}

      {recommendations.length >
        0 && (
        <section className="min-w-0">
          <div className="mb-5 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#355c50]">
              Keep exploring
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#12372f]">
              More like this
            </h2>

            <p className="mt-1 text-sm text-[#6a8077]">
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

      </div>
    </MediaDetailModal>
  );
}