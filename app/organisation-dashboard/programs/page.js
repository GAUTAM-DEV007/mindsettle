import Link from "next/link";

export default function OrganisationProgramsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Programs</h1>
      <p className="mt-1 text-neutral-600">
        Organisation-specific programs aren&apos;t built yet.
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <p className="text-sm text-neutral-600">
          In the meantime, your members can already browse MindSettle&apos;s
          full program library.
        </p>
        <Link
          href="/programs"
          className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Browse programs →
        </Link>
      </div>
    </div>
  );
}
