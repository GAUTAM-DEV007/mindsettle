import Link from "next/link";
import BreathingExercise from "@/components/wellbeing/BreathingExercise";

export const metadata = {
  title: "How Mindsettle works",
  description: "See how Mindsettle combines calming media, simple controls and a guided breathing reset for stressful moments.",
};

const FEATURES = [
  ["01", "A curated media library", "Private video, audio and imagery can be organised by category and made available only when it is ready for viewers."],
  ["02", "Mood-led discovery", "Viewers can find published sessions by mood, category or search—making it easier to choose what feels right in the moment."],
  ["03", "Programs with purpose", "Administrators can arrange approved media into ordered programs for different spaces and experiences."],
  ["04", "A personal library", "Signed-in viewers can save favourites and continue from their recent watch progress."],
  ["05", "Controlled administration", "Role-based administration protects publishing, media uploads, categories, programs and platform reporting."],
  ["06", "Organisation access", "Organisation accounts can manage their own member list without gaining access to another organisation's records."],
];

const FEATURE_ACCENTS = [
  "bg-[#dfe8d6] text-[#476052]",
  "bg-[#dce8ed] text-[#405d69]",
  "bg-[#f1ded2] text-[#8a513f]",
  "bg-[#eee6d6] text-[#705f3e]",
  "bg-[#e3e0e8] text-[#665a70]",
  "bg-[#dfe8d6] text-[#476052]",
];

export default function FeaturesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#dfe8d6] px-6 pb-24 pt-44 sm:pb-32">
        <div className="absolute -right-28 top-20 h-96 w-96 rounded-full bg-[#f1ded2]/80 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#c7d9de]/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_.85fr] lg:gap-20 lg:px-4">
          <div>
            <p className="eyebrow !text-[#8a513f]">How it works</p>
            <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#29383e] sm:text-7xl">Calm should feel simple to bring into the room.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#53645e]">Mindsettle keeps the technology quiet so thoughtful content—and the atmosphere it creates—can take the lead.</p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-[0_24px_70px_rgba(41,56,62,.10)] backdrop-blur-md sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6a7f75]">A quiet pathway</p>
            <div className="mt-7 space-y-3">
              {[["01", "Choose", "Find the mood or setting."], ["02", "Play", "Start on a supported screen."], ["03", "Settle", "Let nature soften the space."]].map(([number, title, copy]) => (
                <div key={number} className="flex items-center gap-4 rounded-2xl border border-[#d7dfd8] bg-[#fbfaf6] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#344d5a] text-xs font-bold text-white">{number}</span>
                  <div><p className="font-semibold text-[#29383e]">{title}</p><p className="mt-1 text-sm text-[#687870]">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f7f0] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="eyebrow">Thoughtful by design</p><h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] text-[#29383e] sm:text-5xl">Everything needed, nothing in the way.</h2></div>
            <p className="max-w-2xl text-lg leading-8 text-[#53645e]">From finding the right session to managing access, each part of Mindsettle is designed to stay clear, secure and easy to use.</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([number, title, description], index) => (
              <article key={number} className="group rounded-[2rem] border border-[#d9dfda] bg-white p-8 transition hover:-translate-y-1 hover:border-[#b8c7bc] hover:shadow-[0_18px_45px_rgba(41,56,62,.08)] sm:p-9">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold tracking-[.12em] ${FEATURE_ACCENTS[index]}`}>{number}</div>
                <h3 className="mt-12 text-2xl font-semibold text-[#29383e]">{title}</h3>
                <p className="mt-4 leading-7 text-[#5b6a64]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#e6ece2] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <BreathingExercise />
        </div>
      </section>

      <section className="bg-[#163d34] px-6 py-20 text-center text-white">
        <h2 className="text-4xl font-semibold tracking-[-0.04em]">Bring Mindsettle into your space.</h2>
        <p className="mx-auto mt-5 max-w-xl text-[#d9e6de]">Talk with us about the setting, audience and experience you have in mind.</p>
        <Link href="/contact" className="mt-8 inline-flex rounded-full bg-[#d7f2ad] px-7 py-4 text-sm font-semibold text-[#29383e] transition hover:bg-white">Start a conversation ↗</Link>
      </section>
    </>
  );
}
