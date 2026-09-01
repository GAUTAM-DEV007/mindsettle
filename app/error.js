"use client";

import Link from "next/link";

export default function ErrorPage({ retry }) {
  return (
    <section role="alert" className="mx-auto my-20 max-w-xl rounded-3xl border border-[#dfe5dc] bg-[#fffdfa] p-8 text-[#163d34] shadow-sm">
      <h1 className="text-2xl font-semibold">We couldn&apos;t load this page</h1>
      <p className="mt-3 leading-7 text-[#5a6d66]">A connection or service may be temporarily unavailable. Please try again. If this continues, contact support.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <button onClick={() => retry()} className="rounded-full bg-[#163d34] px-5 py-3 font-semibold text-white">Try again</button>
        <Link href="/contact" className="rounded-full border border-[#163d34] px-5 py-3 font-semibold">Contact support</Link>
      </div>
    </section>
  );
}
