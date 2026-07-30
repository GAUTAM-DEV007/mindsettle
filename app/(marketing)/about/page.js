const VALUES = [
  {
    icon: "♡",
    title: "Calm & Wellbeing",
    description: "We put patient wellbeing first.",
  },
  {
    icon: "ϟ",
    title: "Simplicity",
    description: "Easy for any staff to use.",
  },
  {
    icon: "♿",
    title: "Accessibility",
    description: "Works in all clinical settings.",
  },
  {
    icon: "▣",
    title: "Privacy",
    description: "Fully compliant with Australian privacy law.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-24">
      <section className="bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            About Mindsettle
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Bringing calm to clinical environments across Australia.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="mb-5 h-14 w-1 bg-emerald-500" />

            <h2 className="text-3xl font-bold text-slate-950">Our Mission</h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Mindsettle was founded with one goal: to make hospitals and
              clinical settings feel calmer for patients, families and staff.
              We believe the right environment can have a genuine impact on how
              people feel when they are at their most vulnerable.
            </p>
          </div>

          <div className="flex min-h-72 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
            Team / Office Image
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl bg-slate-200 text-sm text-slate-500">
            <span>Founder Photo</span>
            <span className="mt-2 text-xs">Lisa Behan, Founder</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-950">Our Story</h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Mindsettle started as a simple idea: what if the screens already
              in hospital waiting rooms could show something calming instead of
              news or advertisements? From that question grew a platform that
              now serves facilities across Australia, delivering nature videos
              and audio that genuinely help patients feel more at ease.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-950">Our Values</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">
                  {value.icon}
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {value.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}