import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Meet the minds",
  description: "Meet the artists, filmmakers and specialists behind Mindsettle's calming clinical experiences.",
};

const TEAM = [
  {
    name: "Lisa Behan",
    role: "Founder & artist",
    bio: "Inspired by walks in nature, Lisa began developing tranquil visual art in 2017 to increase calm and wellbeing in viewers. Mindsettle is the culmination of that work—using natural imagery and original soundtracks to help people slow down, feel centred and stay calm.",
    image: "/lisa-behan.jpg",
    alt: "Lisa Behan seated beside a rainforest stream with her camera",
  },
  {
    name: "Dr Jan Cattoni",
    role: "Filmmaker, academic & paediatric intensive care nurse",
    bio: "Jan brings together filmmaking, academia and clinical experience. Her ethical filmmaking work has often centred vulnerable people and marginalised communities, with credits across ABC, SBS, RTÉ, ICTV and NITV.",
    image: "/team/jan-cattoni.jpg",
    alt: "Dr Jan Cattoni outdoors in a mountain landscape",
    imageClass: "object-center",
  },
  {
    name: "Jacinta Shackleton",
    role: "Marine biologist & conservationist",
    bio: "Working on the Great Barrier Reef, Jacinta captures marine life as it moves through an ordinary day on the coral reef—bringing rarely seen natural moments into Mindsettle's visual world.",
    image: "/team/jacinta-shackleton.jpg",
    alt: "Jacinta Shackleton swimming underwater beside a sea turtle",
    imageClass: "object-center",
  },
  {
    name: "Ricardo Nankoo",
    role: "Aerial photographer",
    bio: "An award-winning Brisbane drone photographer specialising in nature, landscape and aerial imagery, Ricardo reveals Australia's raw natural beauty from a fresh perspective.",
    image: "/team/ricardo-nankoo.jpg",
    alt: "Ricardo Nankoo holding his drone controls beside a lake",
    imageClass: "object-bottom",
  },
  {
    name: "Nomyn",
    role: "Soundscape artist",
    bio: "Nomyn creates atmospheric music that gives Mindsettle's natural imagery its immersive, calming sonic dimension.",
    image: "/team/nomyn.png",
    alt: "Nomyn artist wordmark over a night mountain scene",
    imageClass: "object-center",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#163d34] px-6 pb-24 pt-44 text-white sm:pb-32">
        <Image src="/Background.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2d26] via-[#163d34]/90 to-[#163d34]/50" />
        <div className="relative mx-auto max-w-7xl lg:px-4">
          <p className="eyebrow !text-[#b7d889]">Our story</p>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-7xl">Art, science and technology—brought together for calm.</h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-emerald-50/80">Mindsettle is an Australian profit-for-purpose enterprise creating evidence-based solutions that improve wellbeing and build mental resilience.</p>
        </div>
      </section>

      <section className="bg-[#f5f5ed] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[.8fr_1.2fr] lg:gap-24 lg:px-10">
          <div>
            <p className="eyebrow">How it began</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#163d34] sm:text-5xl">From a walk in nature to clinical settings.</h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-[#4b615b]">
            <p>In 2017, artist Lisa Behan began focusing her practice on tranquil visual stimulus, driven by a desire to increase calm and wellbeing in viewers.</p>
            <p>That work became Mindsettle: natural imagery curated to original soundtracks, designed as a powerful catalyst for people to slow down, feel centred and experience a deep sense of release.</p>
            <p>Today, Mindsettle is used to calm patients in clinical environments, including both St Vincent&apos;s Hospitals in Brisbane.</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <p className="eyebrow">Meet the minds</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#163d34] sm:text-5xl">A multidisciplinary creative team.</h2>
            <p className="mt-6 text-lg leading-8 text-[#5a6d66]">Artists, clinicians, filmmakers and conservationists contribute their knowledge and craft to the Mindsettle experience.</p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            {TEAM.map((member, index) => index === 0 ? (
              <article key={member.name} className="rounded-3xl border border-[#dfe5dc] bg-[#dce8ca] p-8 md:col-span-2 md:grid md:grid-cols-[.65fr_1fr] md:items-center md:gap-10 sm:p-10">
                <div className="relative mb-8 aspect-square overflow-hidden rounded-2xl bg-[#cbd9b8] md:mb-0">
                  <Image src={member.image} alt={member.alt} fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#728469]">{member.role}</p>
                  <h3 className="mt-5 text-2xl font-semibold text-[#163d34]">{member.name}</h3>
                  <p className="mt-4 max-w-3xl leading-7 text-[#52665f]">{member.bio}</p>
                </div>
              </article>
            ) : (
              <article key={member.name} className="overflow-hidden rounded-3xl border border-[#dfe5dc] bg-[#fafbf7]">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#e9eee5]">
                  <Image src={member.image} alt={member.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className={`object-cover ${member.imageClass}`} />
                </div>
                <div className="p-8 sm:p-10">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-[#728469]">{member.role}</p>
                  <h3 className="mt-5 text-2xl font-semibold text-[#163d34]">{member.name}</h3>
                  <p className="mt-4 max-w-3xl leading-7 text-[#52665f]">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#163d34] px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Interested in working together?</h2>
          <p className="mt-5 text-lg text-emerald-50/75">Mindsettle welcomes enquiries from potential clients and collaborators.</p>
          <Link href="/contact" className="mt-8 inline-flex rounded-full bg-[#d7f2ad] px-7 py-4 text-sm font-semibold text-[#163d34] transition hover:bg-white">Start a conversation ↗</Link>
        </div>
      </section>
    </>
  );
}
