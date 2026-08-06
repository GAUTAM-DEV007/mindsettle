import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { removeFavourite } from "@/lib/actions/favourites";
import VideoCard from "@/components/video/VideoCard";

export default async function FavouritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: favourites, error } = await supabase
    .from("favourites")
    .select(
      "video_id, videos(id, title, instructor, duration_minutes, thumbnail_url)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Your favourites</h1>

      {favourites.length === 0 ? (
        <p className="text-sm text-neutral-600">
          You haven&apos;t saved any videos yet. Browse the{" "}
          <Link href="/library" className="text-emerald-700">
            library
          </Link>{" "}
          and tap &ldquo;Save&rdquo; on a video to add it here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map(({ videos: video }) => (
            <div key={video.id} className="flex flex-col gap-2">
              <VideoCard
                video={{
                  id: video.id,
                  title: video.title,
                  instructor: video.instructor,
                  durationMinutes: video.duration_minutes,
                  thumbnailUrl: video.thumbnail_url,
                }}
              />
              <form action={removeFavourite}>
                <input type="hidden" name="videoId" value={video.id} />
                <input type="hidden" name="redirectPath" value="/favourites" />
                <button
                  type="submit"
                  className="w-full rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
