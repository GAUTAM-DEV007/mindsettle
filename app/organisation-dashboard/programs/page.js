import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";
import ServiceUnavailable from "@/components/ui/ServiceUnavailable";

export const dynamic = "force-dynamic";

export default async function OrganisationProgramsPage() {
  await requireRole("organisation");
  const supabase = await createClient();
  const { data: programs, error } = await supabase
    .from("programs")
    .select("id, title, description, slug")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(9);

  if (error) {
    console.error("Could not load organisation programs:", error);
    return <ServiceUnavailable subject="programs" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Included wellbeing content
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#163d34]">Programs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            These curated programs are available to you and to active members covered by your organisation plan.
          </p>
        </div>
        <Link
          href="/programs"
          className="shrink-0 rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285c4f]"
        >
          Open full library →
        </Link>
      </div>

      {(programs ?? []).length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              className="group flex min-h-52 flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                MindSettle program
              </p>
              <h2 className="mt-3 text-lg font-semibold text-[#163d34]">{program.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">
                {program.description || "A guided collection of wellbeing sessions for your team."}
              </p>
              <p className="mt-auto pt-6 text-sm font-semibold text-emerald-700 transition group-hover:translate-x-1">
                View program →
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-[#163d34]">No published programs yet</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Individual sessions remain available in the wellbeing library while new programs are prepared.
          </p>
          <Link href="/library" className="mt-5 inline-flex text-sm font-semibold text-emerald-700">
            Browse sessions →
          </Link>
        </div>
      )}
    </div>
  );
}
