import ConfigMissingNotice from "./ConfigMissingNotice";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  trialing: "bg-sky-50 text-sky-700",
  past_due: "bg-amber-50 text-amber-700",
  canceled: "bg-red-50 text-red-700",
  incomplete: "bg-slate-100 text-slate-600",
};

// Reuses the same subscription rows as Subscription Management, presented
// as a billing-focused view (cycle, renewal, individual vs organisation)
// rather than a status/cancel-focused one.
export default function BillingManagement({ subscriptions, configured }) {
  if (!configured) {
    return (
      <ConfigMissingNotice
        envVar="SUPABASE_SERVICE_ROLE_KEY"
        purpose="list billing records"
      />
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl border border-sky-100 bg-white p-6 text-center shadow-md">
        <p className="text-sm text-slate-500">No billing records yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-md">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Plan</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Billing cycle</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Renewal</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-3 text-slate-700">{sub.email}</td>
              <td className="px-5 py-3 text-slate-600">{sub.plan || "—"}</td>
              <td className="px-5 py-3 capitalize text-slate-600">{sub.planType}</td>
              <td className="px-5 py-3 capitalize text-slate-600">
                {sub.billingCycle || "—"}
              </td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[sub.status] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {sub.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-5 py-3 text-slate-600">
                {sub.currentPeriodEnd
                  ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
