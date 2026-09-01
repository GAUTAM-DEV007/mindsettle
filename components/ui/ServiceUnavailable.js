import Link from "next/link";

export default function ServiceUnavailable({ subject = "account details" }) {
  return (
    <section role="alert" className="mx-auto my-10 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <h1 className="text-xl font-semibold">We couldn&apos;t load your {subject}</h1>
      <p className="mt-3 text-sm leading-6">Your data has not been removed. The service may be unavailable or awaiting a database update. Please try again shortly or contact support.</p>
      <Link href="/contact" className="mt-4 inline-block text-sm font-semibold underline">Contact support</Link>
    </section>
  );
}
