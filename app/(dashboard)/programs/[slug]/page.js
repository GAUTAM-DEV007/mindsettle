import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import VideoCard from "@/components/video/VideoCard";

export const dynamic = "force-dynamic";

async function createSignedUrl(
  supabase,
  path,
  expiresIn = 3600
) {
  if (!path) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from("videos")
    .createSignedUrl(
      path,
      expiresIn
    );

  if (error) {
    console.error(
      "Program media signed URL error:",
      error
    );

    return null;
  }

  return data?.signedUrl || null;
}

export default async function ProgramPage({
  params,
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: program,
    error: programError,
  } = await supabase
    .from("programs")
    .select(`
      id,
      title,
      slug,
      description,
      is_published
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (programError) {
    console.error(
      "Program loading error:",
      programError
    );

    throw new Error(
      `Failed to load program: ${programError.message}`
    );
  }

  if (!program) {
    notFound();
  }

  const {
    data: programVideos,
    error: videosError,
  } = await supabase
    .from("program_videos")
    .select(`
      position,
      videos (
        id,
        title,
        description,
        instructor,
        duration_minutes,
        thumbnail_url,
        video_url,
        is_premium,
        is_published
      )
    `)
    .eq("program_id", program.id)
    .order("position", {
      ascending: true,
    });

  if (videosError) {
    console.error(
      "Program videos loading error:",
      videosError
    );

    throw new Error(
      `Failed to load program videos: ${videosError.message}`
    );
  }

  const publishedRows =
    (programVideos || []).filter(
      (row) =>
        row.videos &&
        row.videos.is_published
    );

  const videos =
    await Promise.all(
      publishedRows.map(async (row) => {
        const video = row.videos;

        const [
          thumbnailUrl,
          previewUrl,
        ] = await Promise.all([
          createSignedUrl(
            supabase,
            video.thumbnail_url,
            3600
          ),

          createSignedUrl(
            supabase,
            video.video_url,
            1800
          ),
        ]);

        return {
          id: video.id,
          title: video.title,
          description:
            video.description,
          instructor:
            video.instructor,
          durationMinutes:
            video.duration_minutes,
          thumbnailUrl,
          previewUrl,
          isPremium:
            video.is_premium,
          position:
            row.position,
        };
      })
    );

  return (
    <div className="flex flex-col gap-7">
      <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-6 py-7 shadow-sm sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          MindSettle Program
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {program.title}
        </h1>

        {program.description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {program.description}
          </p>
        )}

        <p className="mt-4 text-xs font-semibold text-slate-500">
          {videos.length}{" "}
          {videos.length === 1
            ? "session"
            : "sessions"}
        </p>
      </section>

      {videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-2"
            >
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                Session {video.position}
              </div>

              <VideoCard
                video={video}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-800">
            This program does not have any sessions yet.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Sessions can be added from the Admin Dashboard.
          </p>
        </div>
      )}
    </div>
  );
}