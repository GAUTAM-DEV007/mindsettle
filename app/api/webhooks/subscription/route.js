import { NextResponse } from "next/server";

// Receives subscription lifecycle events from the billing provider
// (e.g. Stripe) and syncs status to the Supabase `subscriptions` table.
export async function POST(request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  await request.text();

  // Billing is intentionally fail-closed until a provider secret and
  // verified event handler are configured. Returning success here would
  // silently discard real subscription changes.
  return NextResponse.json(
    { error: "Subscription webhooks are not configured." },
    { status: 503 }
  );
}
