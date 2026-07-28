import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VIDEOS, PROGRAMS } from "@/lib/data/content";
import VideoCard from "@/components/video/VideoCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-neutral-600">{user?.email}</p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Continue watching</h2>
          <Link href="/library" className="text-sm text-emerald-700">
            Browse library
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Programs for you</h2>
          <Link href="/programs" className="text-sm text-emerald-700">
            See all programs
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROGRAMS.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="rounded-xl border border-neutral-200 p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="font-medium">{program.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">
                {program.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
