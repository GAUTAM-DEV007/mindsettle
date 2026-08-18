import Link from "next/link";
import BreathingExercise from "@/components/wellbeing/BreathingExercise";

export const metadata = {
  title: "How Mindsettle works",
  description:
    "Discover how Mindsettle brings calming media, thoughtful access and a guided breathing reset into shared spaces.",
};

const PILLARS = [
  {
    number: "01",
    eyebrow: "Find what fits",
    title: "Calm that meets the moment.",
    description:
      "Choose by mood, setting or intention. A carefully arranged library makes it easy to find something gentle without adding more decisions to the day.",
    items: ["Curated nature media", "Mood-led discovery"],
    tone: "bg-[#dfe9e8]",
    accent: "bg-[#8eb7ba] text-[#213f47]",
  },
  {
    number: "02",
    eyebrow: "Press play",
    title: "The technology stays quiet.",
    description:
      "Simple controls help viewers begin quickly, save what works and return to familiar sessions—so the experience feels supportive rather than technical.",
    items: ["Personal favourites", "Continue watching"],
    tone: "bg-[#eee5ef]",
    accent: "bg-[#c7b3ce] text-[#473b50]",
  },
  {
    number: "03",
    eyebrow: "Care behind the scenes",
    title: "Thoughtful access, clearly managed.",
    description:
      "Approved media, purposeful programs and role-based tools give teams control while keeping each organisation’s people and records safely separated.",
    items: ["Purpose-built programs", "Protected organisation access"],
    tone: "bg-[#f3e3d8]",
    accent: "bg-[#dda88f] text-[#5f392e]",
  },
];

const PATHWAY = [
  ["01", "Choose", "Match the content to the room."],
  ["02", "Play", "Begin with one clear action."],
  ["03", "Settle", "Let sight and sound soften the space."],
];

export default function FeaturesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#f4f1e9] px-6 pb-20 pt-40 sm:pb-28 sm:pt-44">
        <div className="absolute -left-40 top-28 h-[28rem] w-[28rem] rounded-full bg-[#dbe7e6]/70 blur-3xl" />
        <div className="absolute -right-32 top-4 h-[32rem] w-[32rem] rounded-full bg-[#f0ddd2]/75 blur-3xl" />

        <div className="relative mx-auto max-w-7xl lg:px-4">
          <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_.96fr] lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-[#91aaa6]/30 bg-white/60 px-4 py-2 text-[.7rem] font-bold uppercase tracking-[.18em] text-[#536f6c] backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#c58f78]" />
                Calm, made easier
              </div>
              <h1 className="mt-7 max-w-4xl text-balance text-5xl font-medium leading-[1.03] tracking-[-0.05em] text-[#293f46] sm:text-7xl">
                A quieter experience,
                <span className="block font-normal text-[#6d8585]">
                  from the first touch.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#5f6e6d]">
                Mindsettle brings nature, sound and simple digital tools
                together—helping shared spaces feel less clinical and more
                human.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#breathing-reset"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#29464d] px-7 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(41,70,77,.18)] transition hover:-translate-y-0.5 hover:bg-[#203b42]"
                >
                  Try a one-minute reset
                  <span className="ml-3" aria-hidden="true">↓</span>
                </a>
                <Link
                  href="/explore"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#879b98]/35 bg-white/45 px-7 text-sm font-semibold text-[#344f54] transition hover:bg-white/80"
                >
                  Explore the library
                </Link>
              </div>
            </div>

            <div
              className="relative min-h-[31rem] overflow-hidden rounded-[3rem] border border-white/70 bg-[linear-gradient(145deg,#dce8e7_0%,#e9e2ec_52%,#f2ddcf_100%)] p-6 shadow-[0_35px_90px_rgba(67,79,79,.14)] sm:p-9"
              aria-label="Choose, play and settle with Mindsettle"
            >
              <div className="features-ambient-orb absolute -right-12 -top-16 h-72 w-72 rounded-full bg-white/45 blur-2xl" />
              <div className="features-ambient-orb features-ambient-orb-delayed absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-[#e6bbab]/35 blur-3xl" />

              <div className="relative flex h-full min-h-[27rem] flex-col justify-between rounded-[2.3rem] border border-white/60 bg-white/32 p-6 backdrop-blur-md sm:p-8">
                <div className="flex items-center justify-between">
                  <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-[#607977]">
                    A quiet pathway
                  </p>
                  <span className="rounded-full bg-white/55 px-3 py-2 text-xs font-semibold text-[#536a69]">
                    3 simple steps
                  </span>
                </div>

                <div className="mx-auto my-8 flex h-56 w-56 items-center justify-center rounded-full border border-white/70 bg-[radial-gradient(circle_at_35%_28%,#fff_0%,#edf4f2_35%,#b8d1d0_72%,#94b7ba_100%)] shadow-[0_24px_70px_rgba(65,92,95,.18)]">
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/60 bg-white/25 text-center backdrop-blur-sm">
                    <span className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[#6d8585]">
                      In the room
                    </span>
                    <span className="mt-2 text-2xl font-medium tracking-[-0.03em] text-[#2d4a50]">
                      One calm
                      <br />moment
                    </span>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  {PATHWAY.map(([number, title]) => (
                    <div
                      key={number}
                      className="rounded-2xl border border-white/65 bg-white/45 px-4 py-4 text-center backdrop-blur-sm"
                    >
                      <p className="text-[.62rem] font-bold tracking-[.16em] text-[#9b6f60]">
                        {number}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#39555a]">
                        {title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 border-t border-[#829793]/20 pt-7 text-sm text-[#5f7471] sm:grid-cols-3 lg:mt-20">
            {["Nature-led content", "Clear, considered technology", "Australian profit-for-purpose"].map((item) => (
              <p key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#bd876f]" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf6] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
            <div>
              <p className="eyebrow !text-[#9b6b59]">Thoughtful by design</p>
              <h2 className="mt-5 max-w-xl text-balance text-4xl font-medium tracking-[-0.045em] text-[#2b4148] sm:text-6xl">
                Everything needed. Nothing in the way.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#60706e]">
              The experience is intentionally light. Content is easy to find,
              controls are easy to understand and the more complex work stays
              safely behind the scenes.
            </p>
          </div>

          <div className="mt-16 space-y-5">
            {PILLARS.map((pillar, index) => (
              <article
                key={pillar.number}
                className={`${pillar.tone} grid overflow-hidden rounded-[2.6rem] border border-white/75 shadow-[0_18px_55px_rgba(62,74,74,.07)] ${
                  index === 1 ? "lg:grid-cols-[.8fr_1.2fr]" : "lg:grid-cols-[1.2fr_.8fr]"
                }`}
              >
                <div className={`p-8 sm:p-12 lg:p-14 ${index === 1 ? "lg:order-2" : ""}`}>
                  <div className="flex items-center gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold tracking-[.14em] ${pillar.accent}`}>
                      {pillar.number}
                    </span>
                    <p className="text-[.68rem] font-bold uppercase tracking-[.19em] text-[#657876]">
                      {pillar.eyebrow}
                    </p>
                  </div>
                  <h3 className="mt-10 max-w-2xl text-3xl font-medium tracking-[-0.035em] text-[#2c4349] sm:text-5xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-[#586b69]">
                    {pillar.description}
                  </p>
                </div>

                <div className={`flex min-h-72 items-center p-7 sm:p-10 ${index === 1 ? "lg:order-1" : ""}`}>
                  <div className="w-full rounded-[2rem] border border-white/75 bg-white/48 p-5 shadow-[0_16px_40px_rgba(70,82,82,.08)] backdrop-blur-sm sm:p-6">
                    <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-[#71817f]">
                      Included in the experience
                    </p>
                    <div className="mt-5 space-y-3">
                      {pillar.items.map((item, itemIndex) => (
                        <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/55 p-4">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#324f55] text-xs font-semibold text-white">
                            {itemIndex + 1}
                          </span>
                          <p className="font-medium text-[#3a5559]">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1e9] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl rounded-[2.8rem] border border-[#d7ddda] bg-white/55 p-7 sm:p-10 lg:p-14">
          <div className="grid gap-8 md:grid-cols-3">
            {PATHWAY.map(([number, title, copy], index) => (
              <div key={number} className="relative">
                {index < PATHWAY.length - 1 && (
                  <span className="absolute left-12 top-6 hidden h-px w-[calc(100%-3rem)] bg-[#9eb0ad]/35 md:block" />
                )}
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe9e8] text-xs font-bold tracking-[.14em] text-[#3f5f63]">
                  {number}
                </span>
                <h3 className="mt-6 text-2xl font-medium text-[#2d454b]">{title}</h3>
                <p className="mt-3 max-w-xs leading-7 text-[#687774]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="breathing-reset" className="relative scroll-mt-24 overflow-hidden bg-[#e7edef] py-24 sm:py-32">
        <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-[#eadce8]/60 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-[#efd7c9]/55 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <BreathingExercise />
        </div>
      </section>

      <section className="bg-[#f4f1e9] px-6 py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-[#29454b] px-7 py-16 text-center text-white shadow-[0_28px_80px_rgba(41,69,75,.18)] sm:px-12 sm:py-20">
          <div className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-[#84aaad]/25 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-[#d49c84]/20 blur-3xl" />
          <div className="relative">
            <p className="text-[.7rem] font-bold uppercase tracking-[.2em] text-[#bdd2d1]">A calmer room can begin here</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
              Bring Mindsettle into your space.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#d5e1e0]">
              Tell us about your setting and we’ll help shape an experience
              that feels right for the people in it.
            </p>
            <Link href="/contact" className="mt-9 inline-flex min-h-14 items-center justify-center rounded-full bg-[#f3dfd2] px-8 text-sm font-semibold text-[#29454b] transition hover:-translate-y-0.5 hover:bg-white">
              Start a conversation
              <span className="ml-3" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
