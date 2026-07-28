import { NextResponse } from "next/server";

// Receives subscription lifecycle events from the billing provider
// (e.g. Stripe) and syncs status to the Supabase `subscriptions` table.
export async function POST(request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // TODO: verify signature and update subscription status in Supabase.

  return NextResponse.json({ received: true });
}
