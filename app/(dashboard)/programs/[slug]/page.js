import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import VideoCard from "@/components/video/VideoCard";
import { resolveCatalogueAccess } from "@/lib/access/entitlement";

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
    data: { user },
  } = await supabase.auth.getUser();

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
        duration_seconds,
        thumbnail_url,
        video_url,
        is_premium,
        min_tier,
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

  const access = await resolveCatalogueAccess(
    supabase,
    user,
    publishedRows.map((row) => row.videos)
  );

  const videos =
    await Promise.all(
      publishedRows.map(
        async (row) => {
          const video =
            row.videos;

          const videoAccess =
            access.get(video.id) ?? {
              allowed: false,
              requiresUpgrade: true,
            };

          const thumbnailUrl =
            await createSignedUrl(
              supabase,
              video.thumbnail_url,
              3600
            );

          return {
            id: video.id,
            locked: !videoAccess.allowed,
            title:
              video.title,
            description:
              video.description,
            instructor:
              video.instructor,
            durationMinutes:
              video.duration_minutes,
            durationSeconds:
              video.duration_seconds,
            thumbnailUrl,
            previewEndpoint:
              videoAccess.allowed &&
              video.video_url
                ? `/api/media/preview/${video.id}`
                : null,
            isPremium:
              video.is_premium,
            position:
              row.position,
          };
        }
      )
    );

  return (
    <div className="relative flex flex-col gap-8 pb-10">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f5f5ed]" />

      <div className="pointer-events-none fixed right-0 top-24 -z-10 h-[320px] w-[320px] rounded-full bg-[#dce8ca]/35 blur-3xl" />

      {/* PROGRAM HEADER */}

      <section className="rounded-[28px] border border-[#cfd8cb] bg-[#fffdfa] px-6 py-7 shadow-[0_14px_38px_rgba(18,55,47,0.07)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
          MindSettle Program
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#163d34] sm:text-4xl">
          {program.title}
        </h1>

        {program.description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5a6d66] sm:text-base">
            {program.description}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-[#dce8ca] px-3 py-1.5 text-xs font-semibold text-[#163d34]">
            {videos.length}{" "}
            {videos.length === 1
              ? "session"
              : "sessions"}
          </span>

          <span className="text-xs text-[#6c8178]">
            Follow at your own pace.
          </span>
        </div>
      </section>

      {/* SESSIONS */}

      {videos.length > 0 ? (
        <section>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">
              Your journey
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#163d34]">
              Move through each session gently.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a6d66]">
              Take your time and return whenever you want to continue.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map(
              (video) => (
                <article
                  key={video.id}
                  className="
                    flex
                    flex-col
                    gap-3
                    rounded-[24px]
                    border
                    border-[#dfe5dc]
                    bg-[#fafbf7]
                    p-3
                    shadow-[0_8px_24px_rgba(18,55,47,0.05)]
                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:border-[#9bb98a]
                    hover:shadow-[0_16px_32px_rgba(18,55,47,0.09)]
                  "
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#78906f]">
                      Session{" "}
                      {video.position}
                    </span>

                    {video.isPremium && (
                      <span className="rounded-full bg-[#dce8ca] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#163d34]">
                        Premium
                      </span>
                    )}
                  </div>

                  <VideoCard
                    video={video}
                  />
                </article>
              )
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-[#cfd8cb] bg-[#fffdfa] px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-xl text-[#163d34]">
            ✦
          </div>

          <p className="mt-4 font-semibold text-[#29383e]">
            This program does not have any sessions yet.
          </p>

          <p className="mt-1 text-sm text-[#6c8178]">
            Sessions will appear here when they are added and published.
          </p>
        </section>
      )}
    </div>
  );
}