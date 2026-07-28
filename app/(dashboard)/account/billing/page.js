import Button from "@/components/ui/Button";

// TODO: replace with the subscriber's real plan/status once the
// `subscriptions` table (synced via app/api/webhooks/subscription) is wired up.
const subscription = {
  plan: "Monthly",
  status: "active",
  renewsOn: null,
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <div className="max-w-md rounded-xl border border-neutral-200 p-6">
        <p className="text-sm text-neutral-500">Current plan</p>
        <p className="mt-1 text-lg font-medium">{subscription.plan}</p>
        <p className="mt-1 text-sm capitalize text-emerald-700">
          {subscription.status}
        </p>
        <Button variant="secondary" className="mt-6">
          Manage subscription
        </Button>
      </div>
    </div>
  );
}
