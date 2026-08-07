import { notFound } from "next/navigation";
import { getVideoById } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";
import { addFavourite, removeFavourite } from "@/lib/actions/favourites";
import VideoPlayer from "@/components/video/VideoPlayer";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VideoPage({ params }) {
  const { videoId } = await params;
  const supabase = await createClient();

  // Real, Supabase-backed videos have uuid ids. Program pages still
  // link to the static catalog in lib/data/content.js (no `programs`
  // table exists yet), so fall back to that for non-uuid ids.
  const isRealVideo = UUID_RE.test(videoId);

  let video = null;
  let isFavourited = false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isRealVideo) {
    const { data } = await supabase
      .from("videos")
      .select(
        "id, title, instructor, duration_minutes, thumbnail_url, video_url, categories(name)"
      )
      .eq("id", videoId)
      .single();

    if (data) {
      video = {
        id: data.id,
        title: data.title,
        instructor: data.instructor,
        durationMinutes: data.duration_minutes,
        thumbnailUrl: data.thumbnail_url,
        src: data.video_url,
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
    <div className="flex max-w-3xl flex-col gap-4">
      <VideoPlayer src={video.src} poster={video.thumbnailUrl} title={video.title} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{video.title}</h1>
          <p className="mt-1 text-neutral-600">
            {video.instructor} &middot; {video.durationMinutes} min
            {video.category ? <> &middot; {video.category}</> : null}
          </p>
        </div>

        {isRealVideo && user && (
          <form action={isFavourited ? removeFavourite : addFavourite}>
            <input type="hidden" name="videoId" value={video.id} />
            <input type="hidden" name="redirectPath" value={redirectPath} />
            <button
              type="submit"
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isFavourited
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
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
