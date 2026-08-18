"use client";

import { useMemo, useState, useTransition } from "react";
import ConfigMissingNotice from "./ConfigMissingNotice";
import { cancelSubscription } from "@/app/admin/subscriptions-actions";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  trialing: "bg-sky-50 text-sky-700",
  past_due: "bg-amber-50 text-amber-700",
  canceled: "bg-red-50 text-red-700",
  incomplete: "bg-slate-100 text-slate-600",
};

// Real Stripe/subscription statuses this app actually sets (via the
// webhook and cancel action) -- "incomplete" reads as "Pending" here since
// that's what it means (first payment not completed yet), rather than
// inventing a separate status value nothing writes.
const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Cancelled" },
  { value: "incomplete", label: "Pending" },
];

export default function SubscriptionManagement({ subscriptions, configured, showFilters = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!showFilters) {
      return subscriptions;
    }

    const query = search.trim().toLowerCase();

    return subscriptions.filter((sub) => {
      if (statusFilter !== "all" && sub.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        sub.email?.toLowerCase().includes(query) ||
        sub.plan?.toLowerCase().includes(query)
      );
    });
  }, [subscriptions, search, statusFilter, showFilters]);

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
    <div>
      {showFilters && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user email or plan..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 sm:max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 sm:ml-auto">
            {filtered.length} of {subscriptions.length}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-sky-100 bg-white p-6 text-center shadow-md">
          <p className="text-sm text-slate-500">No subscriptions match this search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Start date</th>
                <th className="px-5 py-3">Renews / ended</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <SubscriptionRow key={sub.id} subscription={sub} />
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      <td className="px-5 py-3 text-slate-500 capitalize">{subscription.planType || "—"}</td>
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
        {subscription.startDate
          ? new Date(subscription.startDate).toLocaleDateString()
          : "—"}
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
