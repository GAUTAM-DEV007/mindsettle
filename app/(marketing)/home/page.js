import Button from "@/components/ui/Button";

const PLANS = [
  {
    name: "Monthly",
    price: "$14",
    interval: "/month",
    description: "Full access, cancel anytime.",
  },
  {
    name: "Annual",
    price: "$120",
    interval: "/year",
    description: "Two months free compared to monthly.",
  },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-neutral-600">
          One subscription, unlimited access to every video and program.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border border-neutral-200 p-8"
          >
            <h2 className="text-lg font-medium">{plan.name}</h2>
            <p className="mt-4 text-3xl font-semibold">
              {plan.price}
              <span className="text-base font-normal text-neutral-500">
                {plan.interval}
              </span>
            </p>
            <p className="mt-2 text-sm text-neutral-600">{plan.description}</p>
            <Button href="/signup" variant="primary" className="mt-6 w-full">
              Start free trial
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
