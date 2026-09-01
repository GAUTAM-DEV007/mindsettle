import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-[#163d34]">
      <p className="text-sm font-semibold uppercase tracking-widest">Page not found</p>
      <h1 className="mt-4 text-3xl font-semibold">Let&apos;s get you back on track.</h1>
      <p className="mt-4 text-[#5a6d66]">This page may have moved, or the link may be incorrect.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-[#163d34] px-6 py-3 font-semibold text-white">Back to Mindsettle</Link>
    </main>
  );
}
