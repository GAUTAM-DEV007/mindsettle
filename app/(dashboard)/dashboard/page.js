import Link from "next/link";

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

  /*
   * Load a small set of published
   * media for the overview page.
   */
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

  /*
   * Load published programs created
   * through the Admin Dashboard.
   *
   * This completely replaces the old
   * hard-coded PROGRAMS list.
   */
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

  const videos =
    await Promise.all(
      (
        rawVideos || []
      ).map(
        async (video) => {
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

              createSignedUrl(
                supabase,
                video.video_url,
                1800
              ),
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
          };
        }
      )
    );

  return (
    <div className="flex flex-col gap-10">
      {/* WELCOME */}

      <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-6 py-7 shadow-sm sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          MindSettle
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Welcome back
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Continue with a session,
          explore a program, or choose
          something that matches how
          you feel today.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/library"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Explore Library
          </Link>

          <Link
            href="/mood"
            className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            Choose a mood
          </Link>
        </div>
      </section>

      {/* RECENT / NEW MEDIA */}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Recently added
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Explore the latest
              MindSettle sessions.
            </p>
          </div>

          <Link
            href="/library"
            className="shrink-0 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
          >
            See library →
          </Link>
        </div>

        {videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map(
              (video) => (
                <VideoCard
                  key={
                    video.id
                  }
                  video={
                    video
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="font-semibold text-slate-800">
              No published media yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Published media will
              appear here.
            </p>
          </div>
        )}
      </section>

      {/* ADMIN-CREATED PROGRAMS */}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Programs for you
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Follow structured
              MindSettle programs
              created by the team.
            </p>
          </div>

          <Link
            href="/programs"
            className="shrink-0 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
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
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-800">
                      ◉
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950 transition group-hover:text-emerald-800">
                      {
                        program.title
                      }
                    </h3>

                    {program.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {
                          program.description
                        }
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-semibold text-slate-500">
                        {
                          sessionCount
                        }{" "}
                        {sessionCount ===
                        1
                          ? "session"
                          : "sessions"}
                      </span>

                      <span className="text-sm font-bold text-emerald-700">
                        Open →
                      </span>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="font-semibold text-slate-800">
              No published programs
              yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Programs created and
              published by Admin will
              automatically appear
              here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}