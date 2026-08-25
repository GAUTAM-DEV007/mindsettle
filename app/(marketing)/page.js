import Image from "next/image";
import Link from "next/link";
import CalmingMediaPreview from "@/components/wellbeing/CalmingMediaPreview";
import HeroWaterBackground from "@/components/wellbeing/HeroWaterBackground";
import homeGoldCoastSunrise from "@/public/home-gold-coast-sunrise.jpg";
import homeMistyForest from "@/public/home-misty-forest.jpg";
import homePerthCoast from "@/public/home-perth-coast.jpg";

const BENEFITS = [
  ["01", "Art with purpose", "Tranquil natural imagery is curated with original soundtracks to create space for a deeper sense of release."],
  ["02", "Evidence-led calm", "A considered wellbeing experience designed for clinical and shared care environments."],
  ["03", "Profit for purpose", "An Australian enterprise bringing art, science and technology together for social impact."],
];

const STEPS = [
  ["01", "Choose your setting", "Tell us where Mindsettle will be used and what your space needs.", "#d7e4e6"],
  ["02", "Curate the experience", "Build a calming rotation from guided sessions, natural sound and mindful movement.", "#f0d6c8"],
  ["03", "Bring calm into the room", "Play from any supported screen and let staff stay focused on care.", "#d8e1cf"],
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[760px] overflow-hidden bg-[#173841] pt-24 text-white">
        <HeroWaterBackground />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,32,39,.94)_0%,rgba(11,32,39,.72)_47%,rgba(11,32,39,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,32,39,.55),transparent_48%)]" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f1c0a8]" />
              Calm, made accessible
            </p>
            <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-[5.5rem]">
              Let your mind settle.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              Calming patients in clinical settings through tranquil natural imagery and carefully curated soothing music.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#f4d3c3] px-7 text-sm font-semibold text-[#173841] shadow-[0_12px_32px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Book a conversation <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore the library
              </Link>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/15 bg-[#102f38]/50 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-5 text-sm text-white/75 sm:grid-cols-3 lg:px-10">
            <p><span className="mr-2 text-[#f1c0a8]">●</span>Art, science & technology</p>
            <p><span className="mr-2 text-[#f1c0a8]">●</span>Evidence-led wellbeing</p>
            <p><span className="mr-2 text-[#f1c0a8]">●</span>Australian profit-for-purpose</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#f7f3ed] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-start gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow !text-[#8b695e]">Why Mindsettle</p>
              <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#243b43] sm:text-5xl">
                Calm begins with what the room can see and hear.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#586a6c]">
                Real landscapes, gentle movement and original soundscapes create a softer backdrop for patients, visitors and staff—without asking anyone to stop what they are doing.
              </p>
              <Link href="/about" className="mt-9 inline-flex border-b border-[#243b43] pb-1 text-sm font-semibold text-[#243b43] transition hover:border-transparent">
                Meet the minds <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-4 sm:gap-5" aria-label="Natural scenes featured by Mindsettle">
              <figure className="group relative col-span-12 aspect-[16/8] overflow-hidden rounded-[1.75rem] bg-[#dce6e8] shadow-[0_24px_60px_rgba(34,57,65,.12)]">
                <Image
                  src={homePerthCoast}
                  alt="Rocky coastline and calm blue water near Perth, Western Australia"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#132f38]/50 via-transparent to-transparent" />
                <figcaption className="absolute bottom-5 left-5 rounded-full border border-white/25 bg-[#132f38]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  Western Australia
                </figcaption>
              </figure>

              <figure className="group relative col-span-5 aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#ead9cf] shadow-[0_20px_50px_rgba(34,57,65,.1)]">
                <Image
                  src={homeGoldCoastSunrise}
                  alt="Pastel sunrise and gentle waves on the Gold Coast"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 42vw, 24vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3f3130]/45 via-transparent to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white sm:bottom-5 sm:left-5">Gold Coast dawn</figcaption>
              </figure>

              <figure className="group relative col-span-7 aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#dfe7df] shadow-[0_20px_50px_rgba(34,57,65,.1)]">
                <Image
                  src={homeMistyForest}
                  alt="Morning sunbeams moving through a quiet misty forest"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 58vw, 34vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173b34]/50 via-transparent to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white sm:bottom-5 sm:left-5">Forest light</figcaption>
              </figure>
            </div>
          </div>

          <div className="mt-24 grid border-y border-[#ccd5d2] md:grid-cols-3">
            {BENEFITS.map(([number, title, description], index) => (
              <article
                key={number}
                className="group border-b border-[#ccd5d2] py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#718184]">{number}</p>
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-[#d69b82]" : index === 1 ? "bg-[#7fa1aa]" : "bg-[#8ba07d]"}`}
                  />
                </div>
                <h3 className="mt-12 text-xl font-semibold text-[#243b43]">{title}</h3>
                <p className="mt-3 leading-7 text-[#5a6d70]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#dfe8ea] py-24 text-[#29383e] sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <CalmingMediaPreview />
            <div>
              <p className="eyebrow !text-[#a35f4e]">Content with intention</p>
              <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.035em] text-[#29383e] sm:text-5xl">
                A library that gives the room space to breathe.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#53656a]">
                From quiet nature films and grounding soundscapes to guided mindfulness and gentle movement, every program is selected to support calmer shared environments.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3 text-sm text-[#344a52]">
                {["Nature & sound", "Guided calm", "Gentle movement", "Mindful moments"].map((item) => (
                  <p key={item} className="rounded-xl border border-[#8fa4aa]/40 bg-white/45 px-4 py-4">
                    <span className="mr-2 text-[#a35f4e]">✦</span>{item}
                  </p>
                ))}
              </div>
              <Link href="/explore" className="mt-9 inline-flex items-center rounded-full bg-[#344d5a] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#293d46]">
                Browse content <span className="ml-3" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="eyebrow !text-[#7c6a62]">Simple by design</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#243b43] sm:text-5xl">
              From setup to settled in three steps.
            </h2>
          </div>
          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {STEPS.map(([number, title, copy, accent]) => (
              <article key={number} className="group overflow-hidden rounded-[1.75rem] border border-[#dde4e2] bg-[#fafbf9] p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(35,59,67,.08)] sm:p-10">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#718184]">{number}</p>
                  <span className="h-10 w-10 rounded-full transition group-hover:scale-110" style={{ backgroundColor: accent }} />
                </div>
                <h3 className="mt-14 text-2xl font-semibold text-[#243b43]">{title}</h3>
                <p className="mt-4 leading-7 text-[#5a6d70]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(120deg,#e4ece8_0%,#f0d5c8_100%)] px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow !text-[#80655d]">A gentler space starts here</p>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#243b43] sm:text-6xl">
            Let’s create more room for calm.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#56686a]">
            Tell us about your facility and we’ll help you find the right Mindsettle experience.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#243b43] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#172f37]">
              Book a conversation <span className="ml-3" aria-hidden="true">↗</span>
            </Link>
            <Link href="/features" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#243b43]/25 bg-white/25 px-7 text-sm font-semibold text-[#243b43] transition hover:bg-white/60">
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
