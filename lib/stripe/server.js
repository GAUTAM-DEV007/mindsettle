import Stripe from "stripe";

let stripeClient;

// Server-only. Lazily constructed so simply importing this module doesn't
// throw before STRIPE_SECRET_KEY is configured.
export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local (Stripe dashboard -> Developers -> API keys)."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}
