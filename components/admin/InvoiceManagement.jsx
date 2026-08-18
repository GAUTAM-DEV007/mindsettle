"use client";

import { useTransition } from "react";
import ConfigMissingNotice from "./ConfigMissingNotice";
import { sendInvoiceEmailAction } from "@/app/admin/invoices-actions";

const STATUS_STYLES = {
  paid: "bg-emerald-50 text-emerald-700",
  open: "bg-sky-50 text-sky-700",
  draft: "bg-slate-100 text-slate-600",
  void: "bg-slate-100 text-slate-600",
  uncollectible: "bg-red-50 text-red-700",
};

function formatAmount(cents, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format((cents || 0) / 100);
}

export default function InvoiceManagement({ invoices, configured }) {
  if (!configured) {
    return (
      <ConfigMissingNotice
        envVar="SUPABASE_SERVICE_ROLE_KEY"
        purpose="list every user's invoices"
      />
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-sky-100 bg-white p-6 text-center shadow-md">
        <p className="text-sm text-slate-500">
          No invoices yet -- they&apos;ll appear here once Stripe sends the
          first invoice.paid / invoice.created event.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-md">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Issued</th>
            <th className="px-5 py-3">Email</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceRow({ invoice }) {
  const [isPending, startTransition] = useTransition();
  const invoiceUrl = invoice.hostedInvoiceUrl || invoice.invoicePdf;

  function handleSend() {
    startTransition(() => {
      sendInvoiceEmailAction(invoice.id);
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-5 py-3 text-slate-700">{invoice.email}</td>
      <td className="px-5 py-3 text-slate-600">
        {formatAmount(invoice.amountDue, invoice.currency)}
      </td>
      <td className="px-5 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            STATUS_STYLES[invoice.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {invoice.status}
        </span>
      </td>
      <td className="px-5 py-3 text-slate-500">
        {new Date(invoice.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-3 text-slate-500">
        {invoice.emailSentAt
          ? `Sent ${new Date(invoice.emailSentAt).toLocaleDateString()}`
          : "Not sent"}
      </td>
      <td className="px-5 py-3">
        <button
          type="button"
          disabled={isPending || !invoiceUrl}
          onClick={handleSend}
          title={!invoiceUrl ? "No Stripe-hosted link on this invoice yet" : undefined}
          className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-40"
        >
          {invoice.emailSentAt ? "Resend" : "Send"} invoice
        </button>
      </td>
    </tr>
  );
}
