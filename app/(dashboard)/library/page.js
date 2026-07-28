import { VIDEOS } from "@/lib/data/content";
import VideoCard from "@/components/video/VideoCard";

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Video library</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEOS.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
