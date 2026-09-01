export const MIN_ORGANISATION_SEATS = 5;
export const MAX_SELF_SERVE_ORGANISATION_SEATS = 500;
export const DEFAULT_ORGANISATION_SEATS = 20;
export const ORGANISATION_CURRENCY = "USD";

// These are graduated rates: only the seats inside a band receive that
// band's lower rate. This keeps totals increasing smoothly: 20 / 50 / 100
// seats cost $199 / $399.10 / $699.10 per month respectively.
export const ORGANISATION_PRICING_TIERS = [
  { from: 1, upTo: 20, unitAmountCents: 995, label: "Seats 1–20" },
  { from: 21, upTo: 50, unitAmountCents: 667, label: "Seats 21–50" },
  { from: 51, upTo: 100, unitAmountCents: 600, label: "Seats 51–100" },
  { from: 101, upTo: null, unitAmountCents: 550, label: "Seats 101+" },
];

export function clampOrganisationSeats(value) {
  const parsed = Math.round(Number(value));

  if (!Number.isFinite(parsed)) {
    return DEFAULT_ORGANISATION_SEATS;
  }

  return Math.min(
    Math.max(parsed, MIN_ORGANISATION_SEATS),
    MAX_SELF_SERVE_ORGANISATION_SEATS
  );
}

export function calculateOrganisationPrice(value) {
  const seats = clampOrganisationSeats(value);
  let totalCents = 0;

  for (const tier of ORGANISATION_PRICING_TIERS) {
    if (seats < tier.from) {
      continue;
    }

    const tierEnd = tier.upTo ? Math.min(seats, tier.upTo) : seats;
    const seatCount = tierEnd - tier.from + 1;
    totalCents += seatCount * tier.unitAmountCents;
  }

  const baseRateCents = ORGANISATION_PRICING_TIERS[0].unitAmountCents;
  const baseTotalCents = seats * baseRateCents;
  const savingsCents = Math.max(baseTotalCents - totalCents, 0);
  const discountPercent = baseTotalCents
    ? Math.round((savingsCents / baseTotalCents) * 100)
    : 0;

  return {
    seats,
    totalCents,
    savingsCents,
    discountPercent,
    effectiveSeatPriceCents: Math.round(totalCents / seats),
  };
}
