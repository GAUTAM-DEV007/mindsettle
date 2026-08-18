"use client";

import { useTransition } from "react";
import ConfigMissingNotice from "./ConfigMissingNotice";
import { cancelSubscription } from "@/app/admin/subscriptions-actions";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  trialing: "bg-sky-50 text-sky-700",
  past_due: "bg-amber-50 text-amber-700",
  canceled: "bg-red-50 text-red-700",
  incomplete: "bg-slate-100 text-slate-600",
};

export default function SubscriptionManagement({ subscriptions, configured }) {
  if (!configured) {
    return (
      <ConfigMissingNotice
        envVar="SUPABASE_SERVICE_ROLE_KEY"
        purpose="list every user's subscription"
      />
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl border border-sky-100 bg-white p-6 text-center shadow-md">
        <p className="text-sm text-slate-500">No subscriptions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-md">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Plan</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Renews / ended</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <SubscriptionRow key={sub.id} subscription={sub} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionRow({ subscription }) {
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (
      !confirm(
        `Cancel ${subscription.email}'s subscription${
          subscription.stripeSubscriptionId ? " in Stripe" : ""
        }? This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(() => {
      cancelSubscription(subscription.id);
    });
  }

  const canCancel = subscription.status !== "canceled";

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-5 py-3 text-slate-700">{subscription.email}</td>
      <td className="px-5 py-3 text-slate-600">{subscription.plan || "—"}</td>
      <td className="px-5 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            STATUS_STYLES[subscription.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {subscription.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-5 py-3 text-slate-500">
        {subscription.currentPeriodEnd
          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-5 py-3">
        <button
          type="button"
          disabled={isPending || !canCancel}
          onClick={handleCancel}
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}
