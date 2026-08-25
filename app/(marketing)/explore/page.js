import Image from "next/image";
import Link from "next/link";
import exploreGreatBarrierReef from "@/public/explore-great-barrier-reef.jpg";

export const metadata = {
  title: "Explore",
  description: "Explore Mindsettle's nature collections and the research, ideas and perspectives behind calmer shared environments.",
};

const COLLECTIONS = [
  ["Natural imagery", "Quiet forests, water and landscapes selected to encourage viewers to slow down.", "bg-[#bfd2bd]"],
  ["Great Barrier Reef", "Marine-life footage captured by conservationist and marine biologist Jacinta Shackleton.", "bg-[#b9d3dc]"],
  ["Aerial Australia", "Nature and landscape perspectives from award-winning drone photographer Ricardo Nankoo.", "bg-[#efc7b3]"],
  ["Original soundscapes", "Atmospheric music and curated soothing sound designed to work in harmony with the imagery.", "bg-[#d3c6d7]"],
];

const RESOURCES = [
  {
    type: "Research",
    title: "Nature scenes and stress recovery",
    copy: "A controlled study found that viewing nature scenes before an acute mental stress task supported aspects of autonomic recovery compared with built-environment scenes.",
    source: "Environmental Science & Technology",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3699874/",
    color: "bg-[#dce8ed] text-[#405d69]",
  },
  {
    type: "Healthcare design",
    title: "Nature-based art in waiting rooms",
    copy: "A four-month study across two emergency waiting rooms reported less restlessness and lower noise after nature-based still and video art was introduced.",
    source: "The Journal of Emergency Medicine · PubMed",
    href: "https://pubmed.ncbi.nlm.nih.gov/22325555/",
    color: "bg-[#f1ded2] text-[#8a513f]",
  },
  {
    type: "Research",
    title: "Nature imagery in confined settings",
    copy: "A year-long prison study associated regular nature-video viewing with calmer self-reports and fewer violent infractions in the study setting.",
    source: "University of Utah · Phys.org",
    href: "https://phys.org/news/2017-08-nature-imagery-calms-prisoners.html",
    color: "bg-[#e8e1ea] text-[#66536b]",
  },
  {
    type: "Reading",
    title: "The science of scenery",
    copy: "A wide-ranging resource brings together research on landscape preference, scenic beauty and the ways people respond to natural environments.",
    source: "Scenic Solutions",
    href: "https://scenicsolutions.world/science-of-scenery-book/",
    color: "bg-[#eee6d6] text-[#705f3e]",
  },
  {
    type: "Conversation",
    title: "Meet founder Lisa Behan",
    copy: "Lisa speaks with Jessica Jasch about mental fitness, neuroscience and the experiences that led to the creation of Mindsettle.",
    source: "Founder interview",
    href: "https://youtu.be/irqe3-ieaF4",
    color: "bg-[#dce8ed] text-[#405d69]",
  },
  {
    type: "Community perspective",
    title: "A window onto nature during hospital care",
    copy: "A 2023 advisor update shares one family's experience of calming natural imagery during a prolonged hospital stay.",
    source: "Mindsettle Advisor Update 2023",
    href: "https://www.mindsettle.com/_files/ugd/5d66b6_746c080c11f54edeadb9a20c9ced9616.pdf",
    color: "bg-[#e3eadb] text-[#435c4b]",
  },
];

export default function ExplorePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f3efe5] px-6 pb-24 pt-40 sm:pb-32 sm:pt-44">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#d7e4d0]/80 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#d9e5ea]/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_.9fr] lg:gap-20 lg:px-4">
          <div>
            <p className="eyebrow !text-[#8a513f]">Explore Mindsettle</p>
            <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#29383e] sm:text-7xl">Nature, observed with patience.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#53645e]">Natural imagery and original music come together in unhurried experiences designed to give busy spaces room to breathe.</p>
            <div className="mt-9 flex flex-wrap gap-2.5 text-sm font-semibold text-[#435b54]">
              {['Quiet films', 'Original sound', 'Gentle guidance'].map((item) => <span key={item} className="rounded-full border border-[#bdc9be] bg-white/65 px-4 py-2.5">{item}</span>)}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-[10px] border-white/70 shadow-[0_28px_80px_rgba(41,56,62,.16)]">
              <Image src={exploreGreatBarrierReef} alt="Aerial view of turquoise water and coral formations in the Great Barrier Reef" fill preload placeholder="blur" sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover object-[center_68%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#173845]/70 via-transparent to-transparent" />
              <p className="absolute bottom-6 left-6 rounded-full border border-white/30 bg-[#173845]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-white backdrop-blur-md">Ocean · Sound · Stillness</p>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-[#dce8ed] px-5 py-4 text-sm font-semibold text-[#29383e] shadow-xl sm:block">A quieter view of the world.</div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="eyebrow">Inside the library</p><h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] text-[#29383e] sm:text-5xl">Four ways to find a calmer moment.</h2></div>
            <p className="max-w-2xl text-lg leading-8 text-[#53645e]">Each collection offers a different perspective, while sharing the same quiet pace and thoughtful approach.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {COLLECTIONS.map(([title, copy, color], index) => (
              <article key={title} className="group mt-10 min-h-72 rounded-[2rem] border border-[#d9dfda] bg-[#faf9f4] p-8 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(41,56,62,.08)] sm:p-10">
                <div className="flex items-center justify-between"><span className={`h-3 w-16 rounded-full ${color}`} /><p className="text-xs font-bold tracking-[.18em] text-[#829189]">0{index + 1}</p></div>
                <h3 className="mt-20 text-2xl font-semibold text-[#29383e]">{title}</h3>
                <p className="mt-4 max-w-lg leading-7 text-[#5b6a64]">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-[#cbd8c7] bg-[#e3eadb] p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="text-2xl font-semibold text-[#2f3a3e]">Already have access?</h2>
              <p className="mt-2 text-[#5c686b]">Sign in to browse the complete published library.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="rounded-full bg-[#344d5a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#273d47]">Sign in</Link>
              <Link href="/contact" className="rounded-full border border-[#344d5a]/20 px-6 py-3 text-sm font-semibold text-[#344d5a] transition hover:bg-[#dfe7e8]">Enquire</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1e9] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow !text-[#a35f4e]">Evidence & perspectives</p>
              <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#2f3a3e] sm:text-5xl">Why nature is part of the experience.</h2>
            </div>
            <div className="lg:pb-1">
              <p className="max-w-2xl text-lg leading-8 text-[#5c686b]">These resources from Mindsettle’s original website explore nature imagery in healthcare, stress recovery and confined environments, alongside the story behind the service.</p>
              <p className="mt-3 text-sm leading-6 text-[#7a8588]">Research findings are context-specific and continue to evolve. Follow each link to read the original source.</p>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((resource) => (
              <article key={resource.title} className="flex min-h-[330px] flex-col rounded-[2rem] border border-[#d9dfda] bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(41,56,62,.08)]">
                <p className={`w-fit rounded-full px-3 py-1.5 text-[.68rem] font-bold uppercase tracking-[.16em] ${resource.color}`}>{resource.type}</p>
                <h3 className="mt-9 text-2xl font-semibold leading-tight text-[#29383e]">{resource.title}</h3>
                <p className="mt-4 leading-7 text-[#5b6a64]">{resource.copy}</p>
                <div className="mt-auto border-t border-[#e0e5e1] pt-5">
                  <p className="text-xs text-[#7a8588]">{resource.source}</p>
                  <a href={resource.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-[#344d5a] transition hover:text-[#a35f4e]">Open resource <span className="ml-2" aria-hidden="true">↗</span></a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-5 rounded-[2rem] bg-[#344d5a] p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#f3c5ad]">About the service</p>
              <h3 className="mt-3 text-2xl font-semibold">Mindsettle overview</h3>
              <p className="mt-2 text-[#d4e0e3]">Read the original summary of Mindsettle’s services and intended settings.</p>
            </div>
            <a href="https://www.mindsettle.com/_files/ugd/5d66b6_7df446f26ea649fdbc1df3767b88459c.pdf" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#344d5a] transition hover:bg-[#dfe8d6]">View overview <span className="ml-2" aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
