import ConfigMissingNotice from "./ConfigMissingNotice";

export default function SeatManagement({ organisationSeats, configured }) {
  if (!configured) {
    return (
      <ConfigMissingNotice
        envVar="SUPABASE_SERVICE_ROLE_KEY"
        purpose="list organisation seat usage"
      />
    );
  }

  if (organisationSeats.length === 0) {
    return (
      <div className="rounded-xl border border-sky-100 bg-white p-6 text-center shadow-md">
        <p className="text-sm text-slate-500">No organisation accounts yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-md">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Organisation</th>
            <th className="px-5 py-3">Plan</th>
            <th className="px-5 py-3">Seat limit</th>
            <th className="px-5 py-3">Seats used</th>
            <th className="px-5 py-3">Seats remaining</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {organisationSeats.map((org) => (
            <tr key={org.id} className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-3 text-slate-700">{org.email}</td>
              <td className="px-5 py-3 text-slate-600">{org.planName}</td>
              <td className="px-5 py-3 text-slate-600">{org.seatLimit ?? "—"}</td>
              <td className="px-5 py-3 text-slate-600">{org.seatsUsed}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    org.seatsRemaining === 0
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {org.seatsRemaining ?? "Unlimited"}
                </span>
              </td>
              <td className="px-5 py-3 capitalize text-slate-600">{org.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
