"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvoiceEmail } from "@/lib/email/resend";

function redirectWithError(message) {
  redirect(`/admin?invoicesError=${encodeURIComponent(message)}`);
}

export async function sendInvoiceEmailAction(invoiceId) {
  await requireRole("admin");

  const supabase = createAdminClient();

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, user_id, amount_due, currency, hosted_invoice_url, invoice_pdf")
    .eq("id", invoiceId)
    .single();

  if (invoiceError || !invoice) {
    redirectWithError("Invoice not found.");
  }

  const invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf;

  if (!invoiceUrl) {
    redirectWithError("This invoice has no Stripe-hosted link to send yet.");
  }

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(invoice.user_id);

  if (userError || !userData?.user?.email) {
    redirectWithError("Could not find an email address for this user.");
  }

  try {
    await sendInvoiceEmail({
      to: userData.user.email,
      invoiceUrl,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
    });
  } catch (err) {
    redirectWithError(
      err.message || "Failed to send email. Check RESEND_API_KEY is set."
    );
  }

  const { error } = await supabase
    .from("invoices")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}
