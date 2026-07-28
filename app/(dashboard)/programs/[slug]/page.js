import { notFound } from "next/navigation";
import { getProgramBySlug, getVideoById } from "@/lib/data/content";
import VideoCard from "@/components/video/VideoCard";

export default async function ProgramPage({ params }) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const videos = program.videoIds.map(getVideoById).filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{program.title}</h1>
        <p className="mt-1 text-neutral-600">{program.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
