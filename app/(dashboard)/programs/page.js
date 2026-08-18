import Link from "next/link";

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
      "Dashboard signed URL error:",
      error
    );

    return null;
  }

  return data?.signedUrl || null;
}

export default async function DashboardPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: rawVideos,
    error: videosError,
  } = await supabase
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
      is_premium,
      min_tier,
      is_published,
      created_at
      `
    )
    .eq(
      "is_published",
      true
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(6);

  if (videosError) {
    console.error(
      "Dashboard media loading error:",
      videosError
    );

    throw new Error(
      videosError.message
    );
  }

  const {
    data: programs,
    error: programsError,
  } = await supabase
    .from("programs")
    .select(
      `
      id,
      title,
      slug,
      description,
      created_at,
      program_videos(
        video_id
      )
      `
    )
    .eq(
      "is_published",
      true
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(6);

  if (programsError) {
    console.error(
      "Dashboard programs loading error:",
      programsError
    );

    throw new Error(
      programsError.message
    );
  }

  const access = await resolveCatalogueAccess(
    supabase,
    user,
    rawVideos || []
  );

  const videos =
    await Promise.all(
      (rawVideos || []).map(
        async (video) => {
          const videoAccess =
            access.get(video.id) ?? {
              allowed: false,
              requiresUpgrade: true,
            };

          const [
            thumbnailUrl,
            previewUrl,
          ] =
            await Promise.all([
              createSignedUrl(
                supabase,
                video.thumbnail_url,
                3600
              ),

              videoAccess.allowed
                ? createSignedUrl(
                    supabase,
                    video.video_url,
                    1800
                  )
                : Promise.resolve(null),
            ]);

          return {
            id:
              video.id,

            title:
              video.title,

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

            locked: !videoAccess.allowed,
          };
        }
      )
    );

  return (
    <div className="relative flex flex-col gap-10 pb-10">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#f5f5ed]" />

      <div className="pointer-events-none fixed left-0 top-20 -z-10 h-[320px] w-[320px] rounded-full bg-[#dce8ca]/35 blur-3xl" />

      <div className="pointer-events-none fixed right-0 top-[380px] -z-10 h-[300px] w-[300px] rounded-full bg-[#dfe8d6]/45 blur-3xl" />

      {/* WELCOME */}

      <section className="relative overflow-hidden rounded-[30px] bg-[#12372f] px-6 py-9 text-white shadow-[0_18px_48px_rgba(18,55,47,0.18)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d7f2ad]/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7f2ad] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d7f2ad]" />
            MindSettle
          </p>

          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
            Welcome back.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/85 sm:text-base">
            Find a session, continue with a program,
            or choose something that feels right for
            this moment.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/library"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                rounded-full
                bg-[#d7f2ad]
                px-6
                text-sm
                font-semibold
                text-[#12372f]
                shadow-[0_10px_28px_rgba(0,0,0,.18)]
                transition-all

                hover:-translate-y-0.5
                hover:bg-white
              "
            >
              Explore the library
              <span
                aria-hidden="true"
                className="ml-2"
              >
                →
              </span>
            </Link>

            <Link
              href="/mood"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                rounded-full
                border
                border-white/35
                bg-white/10
                px-6
                text-sm
                font-semibold
                text-white
                backdrop-blur
                transition-all

                hover:-translate-y-0.5
                hover:bg-white/20
              "
            >
              Choose a mood
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT MEDIA */}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">
              New to MindSettle
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#163d34]">
              Recently added
            </h2>

            <p className="mt-1 text-sm text-[#5a6d66]">
              Fresh sessions to bring a little more calm
              into your day.
            </p>
          </div>

          <Link
            href="/library"
            className="shrink-0 text-sm font-semibold text-[#163d34] transition hover:text-[#78906f]"
          >
            See library →
          </Link>
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map(
              (video) => (
                <div
                  key={
                    video.id
                  }
                  className="
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
                  <VideoCard
                    video={
                      video
                    }
                  />
                </div>
              )
            )}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#cfd8cb] bg-[#fffdfa] px-6 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#dce8ca] text-[#163d34]">
              ✦
            </div>

            <p className="mt-4 font-semibold text-[#29383e]">
              No published media yet.
            </p>

            <p className="mt-1 text-sm text-[#6c8178]">
              Published sessions will appear here.
            </p>
          </div>
        )}
      </section>

      {/* PROGRAMS */}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">
              Guided journeys
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#163d34]">
              Programs for you
            </h2>

            <p className="mt-1 text-sm text-[#5a6d66]">
              Follow structured sessions at a pace
              that feels comfortable.
            </p>
          </div>

          <Link
            href="/programs"
            className="shrink-0 text-sm font-semibold text-[#163d34] transition hover:text-[#78906f]"
          >
            See all programs →
          </Link>
        </div>

        {programs?.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map(
              (program) => {
                const sessionCount =
                  program
                    .program_videos
                    ?.length ||
                  0;

                return (
                  <Link
                    key={
                      program.id
                    }
                    href={`/programs/${program.slug}`}
                    className="
                      group
                      rounded-[24px]
                      border
                      border-[#dfe5dc]
                      bg-[#fafbf7]
                      p-6
                      shadow-[0_8px_24px_rgba(18,55,47,0.05)]
                      transition-all
                      duration-300

                      hover:-translate-y-1
                      hover:border-[#9bb98a]
                      hover:bg-[#eef3e8]
                      hover:shadow-[0_18px_34px_rgba(18,55,47,0.10)]
                    "
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-xl text-[#163d34] transition group-hover:bg-[#d7f2ad]">
                      ✦
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#163d34]">
                      {
                        program.title
                      }
                    </h3>

                    {program.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5a6d66]">
                        {
                          program.description
                        }
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t border-[#dfe5dc] pt-4">
                      <span className="text-xs font-medium text-[#6c8178]">
                        {
                          sessionCount
                        }{" "}
                        {sessionCount ===
                        1
                          ? "session"
                          : "sessions"}
                      </span>

                      <span className="text-sm font-semibold text-[#163d34] transition group-hover:translate-x-0.5">
                        Explore →
                      </span>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#cfd8cb] bg-[#fffdfa] px-6 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#dce8ca] text-[#163d34]">
              ✦
            </div>

            <p className="mt-4 font-semibold text-[#29383e]">
              No published programs yet.
            </p>

            <p className="mt-1 text-sm text-[#6c8178]">
              Programs published by the team will
              automatically appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}