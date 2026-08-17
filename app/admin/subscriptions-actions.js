"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/server";

function redirectWithError(message) {
  redirect(`/admin?subscriptionsError=${encodeURIComponent(message)}`);
}

export async function cancelSubscription(subscriptionRowId) {
  await requireRole("admin");

  const supabase = createAdminClient();

  const { data: row, error: fetchError } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("id", subscriptionRowId)
    .single();

  if (fetchError || !row) {
    redirectWithError("Subscription not found.");
  }

  if (row.stripe_subscription_id) {
    try {
      const stripe = getStripeClient();
      await stripe.subscriptions.cancel(row.stripe_subscription_id);
    } catch (err) {
      redirectWithError(
        err.message || "Could not cancel this subscription in Stripe."
      );
    }
  }

  // The webhook will sync the resulting "canceled" status too, but update
  // here so the admin sees it immediately without waiting on Stripe.
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("id", subscriptionRowId);

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/admin");
}
