import Link from "next/link";

export default function LegalDocument({ eyebrow, title, intro, children }) {
  return <>
    <section className="bg-[#dce8ca] px-6 pb-20 pt-44 sm:pb-24"><div className="mx-auto max-w-5xl"><p className="eyebrow">{eyebrow}</p><h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-[#163d34] sm:text-7xl">{title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-[#4b615b]">{intro}</p></div></section>
    <section className="bg-[#f8f8f2] px-6 py-16 sm:py-24"><article className="mx-auto max-w-5xl rounded-[2rem] border border-[#dfe5dc] bg-white p-7 shadow-[0_20px_70px_rgba(22,61,52,.07)] sm:p-12"><div className="legal-copy space-y-10 text-base leading-8 text-[#52665f]">{children}</div><div className="mt-14 flex flex-wrap gap-3 border-t border-[#e1e7df] pt-8"><Link href="/contact" className="rounded-full bg-[#163d34] px-5 py-3 text-sm font-semibold text-white">Contact Mindsettle</Link><Link href="/" className="rounded-full border border-[#163d34]/20 px-5 py-3 text-sm font-semibold text-[#163d34]">Return home</Link></div></article></section>
  </>;
}

export function LegalSection({ title, children }) {
  return <section><h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#163d34]">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>;
}

export function LegalList({ children }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-[#78906f]">{children}</ul>;
}
