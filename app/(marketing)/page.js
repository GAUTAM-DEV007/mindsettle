import Button from "@/components/ui/Button";

const FEATURES = [
  {
    title: "Guided meditation",
    description: "Daily sessions for focus, sleep, and stress relief.",
  },
  {
    title: "Yoga & movement",
    description: "Flows for every level, from beginner to advanced.",
  },
  {
    title: "Structured programs",
    description: "Multi-day series designed to build lasting habits.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Wellness, one video at a time.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">
          Unlimited access to guided meditation, yoga, and mindfulness
          programs from instructors around the world.
        </p>
        <div className="mt-8 flex gap-4">
          <Button href="/signup" variant="primary">
            Start free trial
          </Button>
          <Button href="/pricing" variant="secondary">
            See pricing
          </Button>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <h2 className="font-medium text-neutral-900">{feature.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
