import Button from "@/components/ui/Button";

const FEATURES = [
  {
    icon: "▶",
    title: "Calming Content",
    description: "Nature videos and audio for waiting rooms.",
  },
  {
    icon: "⚙",
    title: "Easy Controls",
    description: "Staff control with no training needed.",
  },
  {
    icon: "▥",
    title: "Usage Reports",
    description: "Track sessions and patient engagement.",
  },
  {
    icon: "◇",
    title: "Secure Platform",
    description: "Australian Privacy Act compliant.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Subscribe",
    description: "Register your facility.",
  },
  {
    number: "2",
    title: "Set Up Content",
    description: "Upload and build playlists.",
  },
  {
    number: "3",
    title: "Press Play",
    description: "Streams instantly.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Patients are visibly more relaxed since we started using Mindsettle.",
    organisation: "Royal North Shore Hospital",
  },
  {
    quote:
      "So easy for staff to set up. No training was needed at all.",
    organisation: "St Vincent's Clinic",
  },
  {
    quote:
      "The usage reports help us see the real impact on patients.",
    organisation: "Westmead Medical Centre",
  },
];

export default function HomePage() {
  return (
    <main>
      <section
        className="relative min-h-[620px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/Background.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Calm the Space Around You
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            Mindsettle delivers soothing calming content to hospitals and
            clinical settings across Australia.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="rounded-md bg-emerald-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Get Started
            </a>

            <a
              href="/about"
              className="rounded-md border border-white px-7 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-950">
              Why Mindsettle?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Everything your facility needs to create a calm and healing
              environment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-950">How It Works</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <article
                key={step.number}
                className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
                  {step.number}
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-950">
              What Facilities Are Saying
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <article
                key={testimonial.organisation}
                className="rounded-lg border-l-4 border-emerald-500 bg-slate-50 p-6"
              >
                <p className="text-sm italic leading-6 text-slate-700">
                  “{testimonial.quote}”
                </p>

                <p className="mt-4 text-xs font-medium text-slate-500">
                  — {testimonial.organisation}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}