import "server-only";

import { Resend } from "resend";

let resendClient;

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normaliseEmailText(value, fallback) {
  const normalized = String(value || fallback).replace(/[\r\n]+/g, " ").trim();
  return normalized.slice(0, 120) || fallback;
}

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
      <p><a href="${escapeHtml(invoiceUrl)}">View and pay your invoice</a></p>
      <p>Thanks,<br />The Mindsettle team</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send the email.");
  }
}

export async function sendOrganisationMemberWelcomeEmail({
  to,
  organisationName,
  temporaryPassword,
  loginUrl,
}) {
  const resend = getResendClient();
  const displayOrganisationName = normaliseEmailText(
    organisationName,
    "Your organisation"
  );
  const safeOrganisationName = escapeHtml(displayOrganisationName);
  const safeTemporaryPassword = escapeHtml(temporaryPassword);
  const safeLoginUrl = escapeHtml(loginUrl);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Mindsettle <welcome@mindsettle.app>",
    to,
    subject: `${displayOrganisationName} invited you to Mindsettle`,
    text: [
      `${displayOrganisationName} has created a Mindsettle account for you.`,
      "",
      `Sign in: ${loginUrl}`,
      `Temporary password: ${temporaryPassword}`,
      "",
      "You will be asked to choose a private password before you can use your member dashboard.",
    ].join("\n"),
    html: `
      <p>Hi,</p>
      <p><strong>${safeOrganisationName}</strong> has created a Mindsettle account for you.</p>
      <p><a href="${safeLoginUrl}">Sign in to Mindsettle</a></p>
      <p>Your temporary password is:</p>
      <p style="font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.04em">${safeTemporaryPassword}</p>
      <p>You will be asked to choose a private password before you can use your member dashboard.</p>
      <p>Thanks,<br />The Mindsettle team</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send the member welcome email.");
  }
}
