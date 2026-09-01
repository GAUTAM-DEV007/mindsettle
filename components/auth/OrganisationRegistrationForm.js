"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_ORGANISATION_SEATS,
  MAX_SELF_SERVE_ORGANISATION_SEATS,
  MIN_ORGANISATION_SEATS,
  ORGANISATION_CURRENCY,
  calculateOrganisationPrice,
  clampOrganisationSeats,
} from "@/lib/billing/organisation-pricing";

const QUICK_SEAT_OPTIONS = [10, 20, 50, 100];

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: ORGANISATION_CURRENCY,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function OrganisationRegistrationForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [organisationName, setOrganisationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seatQuantity, setSeatQuantity] = useState(DEFAULT_ORGANISATION_SEATS);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricing = calculateOrganisationPrice(seatQuantity);

  function updateSeatQuantity(value) {
    setSeatQuantity(clampOrganisationSeats(value));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      const seats = clampOrganisationSeats(seatQuantity);
      const callbackUrl = `${window.location.origin}/auth/callback?redirectTo=/post-login`;
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: adminName.trim(),
            organisation_name: organisationName.trim(),
            requested_role: "organisation",
            requested_seats: seats,
          },
        },
      });

      if (authError) {
        setError(authError.message || "We could not create your organisation account. Please try again.");
        return;
      }

      if (!data.session) {
        setNotice(
          `Your ${seats}-seat selection is saved. Confirm your email, then sign in to continue to secure checkout.`
        );
        return;
      }

      router.replace(`/subscription?seats=${seats}`);
      router.refresh();
    } catch {
      setError("We could not reach the sign-up service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notice) {
    return (
      <div className="rounded-[28px] border border-[#bed3c1] bg-[#f3f8ee] p-7 shadow-[0_18px_50px_rgba(18,55,47,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#65805d]">Account created</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#163d34]">Check your inbox</h2>
        <p className="mt-3 text-sm leading-7 text-[#50665f]">{notice}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285c4f]"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-[28px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_18px_55px_rgba(18,55,47,0.08)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Organisation name" className="sm:col-span-2">
            <input
              name="organisationName"
              autoComplete="organization"
              required
              maxLength={120}
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
              placeholder="e.g. Harbour Health"
              className={inputClass}
            />
          </FormField>

          <FormField label="Organisation admin name">
            <input
              name="adminName"
              autoComplete="name"
              required
              maxLength={100}
              value={adminName}
              onChange={(event) => setAdminName(event.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </FormField>

          <FormField label="Work email">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@organisation.com"
              className={inputClass}
            />
          </FormField>

          <FormField label="Password" className="sm:col-span-2">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="mt-7 border-t border-[#e4e8df] pt-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <label htmlFor="organisation-seats" className="text-sm font-semibold text-[#29473f]">
                How many member accounts do you need?
              </label>
              <p className="mt-1 text-xs leading-5 text-[#71827b]">
                Your organisation-admin account is included and does not use a member seat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="organisation-seats"
                name="seatQuantity"
                type="number"
                inputMode="numeric"
                min={MIN_ORGANISATION_SEATS}
                max={MAX_SELF_SERVE_ORGANISATION_SEATS}
                value={seatQuantity}
                onChange={(event) => setSeatQuantity(event.target.value)}
                onBlur={(event) => updateSeatQuantity(event.target.value)}
                className="w-24 rounded-xl border border-[#cfd9d1] bg-white px-3 py-2.5 text-center text-lg font-bold text-[#163d34] outline-none focus:border-[#78906f] focus:ring-4 focus:ring-[#dce8ca]/60"
              />
              <span className="text-sm font-medium text-[#5a6d66]">seats</span>
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
                {option} seats
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#163d34] px-5 py-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(22,61,52,0.18)] transition hover:-translate-y-0.5 hover:bg-[#285c4f] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "Creating organisation account…" : "Create account and continue to payment"}
        </button>
      </div>

      <aside className="h-fit rounded-[28px] bg-[#163d34] p-6 text-white shadow-[0_20px_55px_rgba(18,55,47,0.18)] sm:p-7 lg:sticky lg:top-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7f2ad]">Monthly estimate</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight">{formatMoney(pricing.totalCents)}</p>
        <p className="mt-1 text-sm text-white/65">per month · {ORGANISATION_CURRENCY}</p>

        <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
          <SummaryRow label="Member accounts" value={pricing.seats} />
          <SummaryRow label="Average per member" value={formatMoney(pricing.effectiveSeatPriceCents)} />
          <SummaryRow
            label="Volume saving"
            value={pricing.savingsCents ? `${formatMoney(pricing.savingsCents)} (${pricing.discountPercent}%)` : "—"}
            highlight={pricing.savingsCents > 0}
          />
        </div>

        <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-xs leading-5 text-white/70">
          Final pricing is shown again before payment. You will not be charged until you complete secure checkout.
        </p>
      </aside>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#cfd9d1] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#98a69f] focus:border-[#78906f] focus:ring-4 focus:ring-[#dce8ca]/60";

function FormField({ label, className = "", children }) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-semibold text-[#29473f] ${className}`}>
      {label}
      {children}
    </label>
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
