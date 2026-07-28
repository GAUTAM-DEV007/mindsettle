import Link from "next/link";
import { PROGRAMS } from "@/lib/data/content";

export default function ProgramsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Programs</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROGRAMS.map((program) => (
          <Link
            key={program.slug}
            href={`/programs/${program.slug}`}
            className="rounded-xl border border-neutral-200 p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="font-medium">{program.title}</h2>
            <p className="mt-1 text-sm text-neutral-600">
              {program.description}
            </p>
            <p className="mt-3 text-xs text-neutral-500">
              {program.videoIds.length} videos
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
