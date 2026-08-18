import { Resend } from "resend";

let resendClient;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local (Resend dashboard -> API Keys)."
    );
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export async function sendInvoiceEmail({ to, invoiceUrl, amountDue, currency }) {
  const resend = getResendClient();

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format((amountDue || 0) / 100);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mindsettle <billing@mindsettle.app>",
    to,
    subject: `Your Mindsettle invoice — ${formattedAmount}`,
    html: `
      <p>Hi,</p>
      <p>Your Mindsettle invoice for ${formattedAmount} is ready.</p>
      <p><a href="${invoiceUrl}">View and pay your invoice</a></p>
      <p>Thanks,<br />The Mindsettle team</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send the email.");
  }
}
