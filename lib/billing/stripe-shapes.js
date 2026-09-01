export function getStripeObjectId(value) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export function getInvoiceSubscriptionId(invoice) {
  return getStripeObjectId(
    invoice.parent?.subscription_details?.subscription ?? invoice.subscription
  );
}

export function getPurchasedSeatQuantity(plan, subscriptionItem) {
  // Legacy fixed packages have quantity=1 in Stripe but include many seats.
  if (plan?.type === "organisation" && plan.slug !== "organisation-flex") {
    const legacyLimit = Number(plan.seat_limit);
    if (Number.isSafeInteger(legacyLimit) && legacyLimit > 0) return legacyLimit;
  }
  if (plan?.type !== "organisation") return 1;
  const quantity = Number(subscriptionItem?.quantity);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1;
}
