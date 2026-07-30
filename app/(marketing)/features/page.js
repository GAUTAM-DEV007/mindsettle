const FEATURES = [
  {
    icon: "▶",
    title: "Content Library",
    description:
      "Browse thousands of calming nature videos and audio tracks, all organised by category. New content is added regularly by the Mindsettle team.",
    alignment: "right",
  },
  {
    icon: "☷",
    title: "Playlist Builder",
    description:
      "Create custom playlists tailored to different wards, waiting rooms or times of day. Drag and drop to organise content however you need.",
    alignment: "left",
    placeholder: "Playlist Builder",
  },
  {
    icon: "☺",
    title: "Mood Tracking",
    description:
      "Track patient mood before and after sessions to see the real impact of calm content. Share results with your clinical team easily.",
    alignment: "right",
  },
  {
    icon: "▥",
    title: "Usage Reports",
    description:
      "View detailed reports on session duration, content popularity and facility-wide engagement trends. Export reports as PDF or CSV.",
    alignment: "left",
    placeholder: "Usage Reports",
  },
];

export default function FeaturesPage() {
  return (
    <main className="pt-24">
      <section className="bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Platform Features
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Everything you need to deliver calm content to your facility.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl space-y-16 px-6 py-20">
          {FEATURES.map((feature, index) => (
            <div key={feature.title}>
              {feature.alignment === "right" ? (
                <div className="grid items-center gap-10 md:grid-cols-2">
                  <div className="flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">
                      {feature.icon}
                    </div>
                  </div>

                  <article className="rounded-xl border-l-4 border-emerald-500 bg-slate-50 p-8">
                    <h2 className="text-2xl font-bold text-slate-950">
                      {feature.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>
                </div>
              ) : (
                <>
                  <article className="rounded-xl border-l-4 border-emerald-500 bg-slate-50 p-8">
                    <h2 className="text-2xl font-bold text-slate-950">
                      {feature.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </article>

                  <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
                    <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
                      {feature.placeholder}
                    </div>

                    <div className="flex justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-700">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {index !== FEATURES.length - 1 && (
                <div className="mt-16 border-b border-slate-100" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 text-center text-white sm:flex-row sm:text-left">
          <h2 className="text-2xl font-semibold">
            Ready to bring Mindsettle to your facility?
          </h2>

          <a
            href="/signup"
            className="rounded-lg bg-white px-7 py-3 font-semibold text-emerald-700 transition hover:bg-sky-50"
          >
            Get Started
          </a>
        </div>
      </section>
    </main>
  );
}