import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const supabase = await createClient();

  const {
    data: programs,
    error,
  } = await supabase
    .from("programs")
    .select(`
      id,
      title,
      slug,
      description,
      program_videos (
        video_id
      )
    `)
    .eq("is_published", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Programs loading error:",
      error
    );

    throw new Error(
      `Failed to load programs: ${error.message}`
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          MindSettle Programs
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-950">
          Programs
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Follow structured collections of sessions designed
          to support you step by step.
        </p>
      </div>

      {programs?.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const videoCount =
              program.program_videos?.length || 0;

            return (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  ◉
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-950 transition group-hover:text-emerald-800">
                  {program.title}
                </h2>

                {program.description && (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {program.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-500">
                    {videoCount}{" "}
                    {videoCount === 1
                      ? "session"
                      : "sessions"}
                  </span>

                  <span className="text-sm font-bold text-emerald-700">
                    View program →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-800">
            No programs are available yet.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Published programs will appear here.
          </p>
        </div>
      )}
    </div>
  );
}