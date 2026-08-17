import Link from "next/link";
import CalmingMediaPreview from "@/components/wellbeing/CalmingMediaPreview";
import HeroWaterBackground from "@/components/wellbeing/HeroWaterBackground";

const BENEFITS = [
  ["01", "Art with purpose", "Tranquil natural imagery is curated to original soundtracks to invoke a deep sense of release."],
  ["02", "Evidence-based calm", "Solutions designed to improve wellbeing and build mental resilience in clinical environments."],
  ["03", "Profit for purpose", "An Australian enterprise bringing together art, science and technology for social impact."],
];

const STEPS = [
  ["01", "Choose your setting", "Tell us where Mindsettle will be used and what your space needs."],
  ["02", "Curate the experience", "Build a calming rotation from guided sessions, natural sound and mindful movement."],
  ["03", "Bring calm into the room", "Play from any supported screen and let staff stay focused on care."],
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[760px] overflow-hidden bg-[#12372f] pt-24 text-white">
        <HeroWaterBackground />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,39,32,.94)_0%,rgba(8,39,32,.72)_48%,rgba(8,39,32,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,39,32,.45),transparent_45%)]" />
        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50 backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-[#b7d889]" />Calm, made accessible</p>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-[5.5rem]">Let your mind settle.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">Calming patients in clinical settings through tranquil natural imagery and curated soothing music.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#d7f2ad] px-7 text-sm font-semibold text-[#12372f] shadow-[0_12px_32px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Book a conversation <span aria-hidden="true" className="ml-3">↗</span></Link>
              <Link href="/explore" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explore the library</Link>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/15 bg-[#082720]/35 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-5 text-sm text-emerald-50/80 sm:grid-cols-3 lg:px-10">
            <p><span className="mr-2 text-[#d7f2ad]">●</span>Art, science & technology</p><p><span className="mr-2 text-[#d7f2ad]">●</span>Evidence-based wellbeing</p><p><span className="mr-2 text-[#d7f2ad]">●</span>Australian profit-for-purpose</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5ed] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
            <div><p className="eyebrow">Why Mindsettle</p><h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#163d34] sm:text-5xl">The environment is part of the experience.</h2></div>
            <div className="lg:pt-10"><p className="max-w-2xl text-lg leading-8 text-[#4b615b]">Mindsettle is designed to be a powerful catalyst for people to slow down, feel centred and stay calm through art. Natural imagery and original soundscapes create a softer backdrop for patients, visitors and staff.</p><Link href="/about" className="mt-8 inline-flex border-b border-[#163d34] pb-1 text-sm font-semibold text-[#163d34] transition hover:border-transparent">Meet the minds <span className="ml-2" aria-hidden="true">→</span></Link></div>
          </div>
          <div className="mt-20 grid border-y border-[#cfd8cb] md:grid-cols-3">
            {BENEFITS.map(([number, title, description]) => <article key={number} className="group border-b border-[#cfd8cb] py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><p className="text-xs font-semibold tracking-[0.18em] text-[#6c8178]">{number}</p><div className="mt-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#dce8ca] text-[#163d34] transition group-hover:-translate-y-1">✦</div><h3 className="mt-7 text-xl font-semibold text-[#163d34]">{title}</h3><p className="mt-3 leading-7 text-[#5a6d66]">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#dfe8d6] py-24 text-[#29383e] sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10"><div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <CalmingMediaPreview />
            <div><p className="eyebrow !text-[#a35f4e]">Content with intention</p><h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#29383e] sm:text-5xl">A library that gives the room space to breathe.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-[#53645e]">From quiet nature films and grounding soundscapes to guided mindfulness and gentle movement, every program is selected to support calmer shared environments.</p><div className="mt-10 grid grid-cols-2 gap-3 text-sm text-[#344a42]">{["Nature & sound", "Guided calm", "Gentle movement", "Mindful moments"].map((item) => <p key={item} className="rounded-xl border border-[#8fa69a]/35 bg-[#fffdfa]/55 px-4 py-4"><span className="mr-2 text-[#6f8791]">✦</span>{item}</p>)}</div><Link href="/explore" className="mt-9 inline-flex items-center rounded-full bg-[#344d5a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#293d46]">Browse content <span className="ml-3" aria-hidden="true">→</span></Link></div>
        </div></div>
      </section>

      <section className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-7xl px-6 lg:px-10"><div className="max-w-2xl"><p className="eyebrow">Simple by design</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#163d34] sm:text-5xl">From setup to settled in three steps.</h2></div><div className="mt-16 grid gap-4 lg:grid-cols-3">{STEPS.map(([number, title, copy]) => <article key={number} className="rounded-3xl border border-[#dfe5dc] bg-[#fafbf7] p-8 sm:p-10"><p className="text-sm font-semibold text-[#78906f]">{number}</p><h3 className="mt-14 text-2xl font-semibold text-[#163d34]">{title}</h3><p className="mt-4 leading-7 text-[#5a6d66]">{copy}</p></article>)}</div></div></section>

      <section className="bg-[#dce8ca] px-6 py-20 sm:py-24"><div className="mx-auto max-w-4xl text-center"><p className="eyebrow">A gentler space starts here</p><h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#163d34] sm:text-6xl">Let’s create more room for calm.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#4b615b]">Tell us about your facility and we’ll help you find the right Mindsettle experience.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/contact" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#163d34] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0b2d26]">Book a conversation <span className="ml-3" aria-hidden="true">↗</span></Link><Link href="/features" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#163d34]/30 px-7 text-sm font-semibold text-[#163d34] transition hover:bg-white/50">See how it works</Link></div></div></section>
    </>
  );
}
