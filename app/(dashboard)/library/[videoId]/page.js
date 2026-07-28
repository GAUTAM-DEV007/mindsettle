import { notFound } from "next/navigation";
import { getVideoById } from "@/lib/data/content";
import VideoPlayer from "@/components/video/VideoPlayer";

export default async function VideoPage({ params }) {
  const { videoId } = await params;
  const video = getVideoById(videoId);

  if (!video) {
    notFound();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <VideoPlayer src={video.src} poster={video.thumbnailUrl} title={video.title} />
      <div>
        <h1 className="text-2xl font-semibold">{video.title}</h1>
        <p className="mt-1 text-neutral-600">
          {video.instructor} &middot; {video.durationMinutes} min &middot;{" "}
          {video.category}
        </p>
      </div>
    </div>
  );
}
