import { notFound } from "next/navigation";
import { getVideoById } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";
import {
  addFavourite,
  removeFavourite,
} from "@/lib/actions/favourites";
import VideoPlayer from "@/components/video/VideoPlayer";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VideoPage({ params }) {
  const { videoId } = await params;

  const supabase = await createClient();

  const isRealVideo = UUID_RE.test(videoId);

  let video = null;
  let isFavourited = false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        categories(name)
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
          signedVideoUrl = signedVideo?.signedUrl ?? null;
        }
      }

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
        category: data.categories?.name ?? null,
      };
    }

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
    video = getVideoById(videoId);
  }

  if (!video) {
    notFound();
  }

  const redirectPath = `/library/${videoId}`;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {video.src ? (
        <VideoPlayer
          src={video.src}
          poster={video.thumbnailUrl}
          title={video.title}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-black text-neutral-400">
          This video does not currently have a playable media file.
        </div>
      )}

      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {video.title}
          </h1>

          <p className="mt-2 text-neutral-500">
            {video.instructor}
            {" • "}
            {video.durationMinutes} min
            {video.category && (
              <>
                {" • "}
                {video.category}
              </>
            )}
          </p>

          {video.description && (
            <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                Description
              </h2>

              <p className="whitespace-pre-wrap leading-7 text-neutral-300">
                {video.description}
              </p>
            </div>
          )}
        </div>

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
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                isFavourited
                  ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500"
                  : "border-neutral-600 text-neutral-300 hover:border-emerald-500 hover:text-white"
              }`}
            >
              {isFavourited ? "♥ Saved" : "♡ Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}