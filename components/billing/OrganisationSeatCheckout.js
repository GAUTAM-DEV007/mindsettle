"use client";

import Link from "next/link";
import { useState } from "react";
import { startCheckout } from "@/app/(dashboard)/subscription/actions";
import {
  MAX_SELF_SERVE_ORGANISATION_SEATS,
  MIN_ORGANISATION_SEATS,
  ORGANISATION_PRICING_TIERS,
  calculateOrganisationPrice,
  clampOrganisationSeats,
} from "@/lib/billing/organisation-pricing";

const QUICK_SEAT_OPTIONS = [10, 20, 50, 100];

function formatMoney(cents, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function OrganisationSeatCheckout({
  plan,
  initialSeats,
  subscription,
}) {
  const [seatQuantity, setSeatQuantity] = useState(initialSeats);
  const pricing = calculateOrganisationPrice(seatQuantity);
  const currency = plan.currency || "usd";
  const hasActiveSubscription = Boolean(subscription);

  function updateSeatQuantity(value) {
    setSeatQuantity(clampOrganisationSeats(value));
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-[28px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_14px_38px_rgba(18,55,47,0.07)] sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#78906f]">Flexible team plan</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#163d34]">Choose your member accounts</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#5a6d66]">
              One organisation-admin account is included. The seats below are for the people that admin invites to MindSettle.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#dce8ca] px-3 py-1.5 text-xs font-bold text-[#163d34]">
            Cancel anytime
          </span>
        </div>

        {hasActiveSubscription ? (
          <div className="mt-7 rounded-2xl border border-[#9bb98a] bg-[#eef5e7] p-5">
            <p className="font-semibold text-[#163d34]">
              Your organisation already has an active subscription
              {subscription.seat_quantity ? ` with ${subscription.seat_quantity} member seats` : ""}.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5a6d66]">
              Manage the current subscription before starting another checkout.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/organisation-dashboard" className="rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white">
                Organisation dashboard
              </Link>
              <Link href="/account/billing" className="rounded-full border border-[#163d34] px-5 py-2.5 text-sm font-semibold text-[#163d34]">
                Manage billing
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-[#dfe5dc] bg-[#f7f8f2] p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <label htmlFor="checkout-seat-quantity" className="text-sm font-semibold text-[#29473f]">
                  Number of member accounts
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="checkout-seat-quantity"
                    type="number"
                    min={MIN_ORGANISATION_SEATS}
                    max={MAX_SELF_SERVE_ORGANISATION_SEATS}
                    value={seatQuantity}
                    onChange={(event) => setSeatQuantity(event.target.value)}
                    onBlur={(event) => updateSeatQuantity(event.target.value)}
                    className="w-24 rounded-xl border border-[#cfd9d1] bg-white px-3 py-2.5 text-center text-lg font-bold text-[#163d34] outline-none focus:border-[#78906f] focus:ring-4 focus:ring-[#dce8ca]/60"
                  />
                  <span className="text-sm text-[#5a6d66]">seats</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_SEAT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateSeatQuantity(option)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      pricing.seats === option
                        ? "border-[#163d34] bg-[#163d34] text-white"
                        : "border-[#d6ddd7] bg-white text-[#52675f] hover:border-[#9bb98a] hover:bg-[#eef3e8]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ORGANISATION_PRICING_TIERS.map((tier) => (
                <div key={tier.from} className="rounded-xl border border-[#e1e6de] bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-[#6a7d75]">{tier.label}</p>
                  <p className="mt-1 font-bold text-[#163d34]">
                    {formatMoney(tier.unitAmountCents, currency)} <span className="text-xs font-medium text-[#71827b]">per added seat</span>
                  </p>
                </div>
              ))}
            </div>

            <form action={startCheckout} className="mt-7">
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="seatQuantity" value={pricing.seats} />
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-2xl bg-[#163d34] px-5 py-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(22,61,52,0.18)] transition hover:-translate-y-0.5 hover:bg-[#285c4f]"
              >
                Continue to secure checkout
              </button>
            </form>
          </>
        )}
      </section>

      <aside className="h-fit rounded-[28px] bg-[#163d34] p-7 text-white shadow-[0_20px_55px_rgba(18,55,47,0.18)] lg:sticky lg:top-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7f2ad]">Plan summary</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight">{formatMoney(pricing.totalCents, currency)}</p>
        <p className="mt-1 text-sm text-white/65">per month · {currency.toUpperCase()}</p>

        <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
          <SummaryRow label="Member accounts" value={pricing.seats} />
          <SummaryRow label="Organisation admins" value="1 included" />
          <SummaryRow label="Average per member" value={formatMoney(pricing.effectiveSeatPriceCents, currency)} />
          <SummaryRow
            label="Volume saving"
            value={pricing.savingsCents ? `${formatMoney(pricing.savingsCents, currency)} (${pricing.discountPercent}%)` : "—"}
            highlight={pricing.savingsCents > 0}
          />
        </div>

        <ul className="mt-6 space-y-2 border-t border-white/15 pt-5 text-sm text-white/75">
          <li>✓ Full MindSettle library</li>
          <li>✓ Organisation member management</li>
          <li>✓ Seats enforced securely</li>
          <li>✓ Automatic volume discounts</li>
        </ul>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/65">{label}</span>
      <span className={highlight ? "font-semibold text-[#d7f2ad]" : "font-semibold text-white"}>{value}</span>
    </div>
  );
}

