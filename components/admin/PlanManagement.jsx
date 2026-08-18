"use client";

import { addPlan, updatePlan, deletePlan, updateVideoTier } from "@/app/admin/plans-actions";

function formatDollars(cents) {
  return ((cents ?? 0) / 100).toFixed(2);
}

export default function PlanManagement({ plans, media, planError }) {
  const individualPlans = plans.filter((p) => p.type === "individual");
  const organisationPlans = plans.filter((p) => p.type === "organisation");

  return (
    <div className="space-y-8">
      {planError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {planError}
        </div>
      )}

      <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
        <h3 className="text-lg font-bold text-[#163d34]">Add plan</h3>
        <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
          Individual plans have no seat limit. Organisation plans should set a seat
          limit -- that&apos;s what drives the seat allowance in the admin Seat
          Management section.
        </p>

        <form action={addPlan} className="mt-6 grid gap-4 border-b border-[#e4e8df] pb-8 lg:grid-cols-3">
          <PlanField label="Name">
            <input name="name" required placeholder="e.g. Organisation Starter" className={inputClass} />
          </PlanField>

          <PlanField label="Type">
            <select name="type" required defaultValue="individual" className={inputClass}>
              <option value="individual">Individual</option>
              <option value="organisation">Organisation</option>
            </select>
          </PlanField>

          <PlanField label="Price (USD)">
            <input name="price" type="number" min="0" step="0.01" defaultValue="0" className={inputClass} />
          </PlanField>

          <PlanField label="Billing cycle">
            <select name="billingCycle" defaultValue="monthly" className={inputClass}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </PlanField>

          <PlanField label="Seat limit (organisation only)">
            <input name="seatLimit" type="number" min="1" placeholder="e.g. 20" className={inputClass} />
          </PlanField>

          <PlanField label="Content tier">
            <input name="tier" type="number" min="1" defaultValue="1" className={inputClass} />
          </PlanField>

          <PlanField label="Stripe price ID">
            <input name="stripePriceId" placeholder="price_..." className={inputClass} />
          </PlanField>

          <div className="lg:col-span-2">
            <PlanField label="Description">
              <input name="description" placeholder="Shown on the Plans page" className={inputClass} />
            </PlanField>
          </div>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] px-4 py-3">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-[#163d34]" />
              <span className="text-sm font-semibold text-[#29383e]">Active</span>
            </label>
          </div>

          <div className="lg:col-span-3">
            <button type="submit" className="rounded-lg bg-[#163d34] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]">
              Add plan
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-8">
          <PlanGroup title="Individual plans" plans={individualPlans} />
          <PlanGroup title="Organisation plans" plans={organisationPlans} />
        </div>
      </article>

      <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
        <h3 className="text-lg font-bold text-[#163d34]">Content access</h3>
        <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
          Set which tier a video needs. 0 = free for everyone (subject to the
          3-free-video allowance). 1+ = requires a subscription at that tier or
          higher.
        </p>

        <div className="mt-5 space-y-2">
          {media.length === 0 ? (
            <p className="text-sm text-[#6c8178]">No media uploaded yet.</p>
          ) : (
            media.map((item) => (
              <form
                key={item.id}
                action={updateVideoTier}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] px-4 py-3"
              >
                <input type="hidden" name="videoId" value={item.id} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#29383e]">
                  {item.title}
                </span>
                <select
                  name="minTier"
                  defaultValue={item.min_tier ?? (item.is_premium ? 1 : 0)}
                  className="rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-sm text-[#163d34] outline-none focus:border-[#78906f]"
                >
                  <option value={0}>Free</option>
                  <option value={1}>Tier 1 (Individual / Org Starter)</option>
                  <option value={2}>Tier 2 (Org Professional)</option>
                  <option value={3}>Tier 3 (Org Enterprise)</option>
                </select>
                <button
                  type="submit"
                  className="rounded-lg border border-[#cfd8cb] px-4 py-2 text-xs font-semibold text-[#163d34] transition hover:bg-[#eef3e8]"
                >
                  Save
                </button>
              </form>
            ))
          )}
        </div>
      </article>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]";

function PlanField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#4b615b]">{label}</label>
      {children}
    </div>
  );
}

function PlanGroup({ title, plans }) {
  return (
    <div>
      <h4 className="text-base font-bold text-[#163d34]">{title}</h4>

      {plans.length === 0 ? (
        <p className="mt-2 text-sm text-[#6c8178]">None yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {plans.map((plan) => (
            <details key={plan.id} className="group overflow-hidden rounded-xl border border-[#dfe5dc] bg-[#f5f5ed]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#eef3e8]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#29383e]">{plan.name}</p>
                  <p className="mt-0.5 text-xs text-[#6c8178]">
                    ${formatDollars(plan.price_cents)}/{plan.billing_cycle === "yearly" ? "yr" : "mo"} · tier {plan.tier}
                    {plan.seat_limit ? ` · ${plan.seat_limit} seats` : ""}
                    {!plan.is_active ? " · inactive" : ""}
                  </p>
                </div>
                <span className="hidden text-xs font-semibold text-[#6c8178] sm:inline">Edit</span>
              </summary>

              <form action={updatePlan} className="border-t border-[#dfe5dc] bg-white p-5">
                <input type="hidden" name="id" value={plan.id} />

                <div className="grid gap-4 lg:grid-cols-3">
                  <PlanField label="Name">
                    <input name="name" required defaultValue={plan.name} className={inputClass} />
                  </PlanField>
                  <PlanField label="Type">
                    <select name="type" defaultValue={plan.type} className={inputClass}>
                      <option value="individual">Individual</option>
                      <option value="organisation">Organisation</option>
                    </select>
                  </PlanField>
                  <PlanField label="Price (USD)">
                    <input name="price" type="number" min="0" step="0.01" defaultValue={formatDollars(plan.price_cents)} className={inputClass} />
                  </PlanField>
                  <PlanField label="Billing cycle">
                    <select name="billingCycle" defaultValue={plan.billing_cycle} className={inputClass}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </PlanField>
                  <PlanField label="Seat limit">
                    <input name="seatLimit" type="number" min="1" defaultValue={plan.seat_limit ?? ""} className={inputClass} />
                  </PlanField>
                  <PlanField label="Content tier">
                    <input name="tier" type="number" min="1" defaultValue={plan.tier} className={inputClass} />
                  </PlanField>
                  <PlanField label="Stripe price ID">
                    <input name="stripePriceId" defaultValue={plan.stripe_price_id ?? ""} className={inputClass} />
                  </PlanField>
                  <div className="lg:col-span-2">
                    <PlanField label="Description">
                      <input name="description" defaultValue={plan.description ?? ""} className={inputClass} />
                    </PlanField>
                  </div>
                  <div className="flex items-end">
                    <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] px-4 py-3">
                      <input type="checkbox" name="isActive" defaultChecked={plan.is_active} className="h-4 w-4 accent-[#163d34]" />
                      <span className="text-sm font-semibold text-[#29383e]">Active</span>
                    </label>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-[#dfe5dc] pt-4 sm:flex-row sm:justify-between">
                  <button type="submit" className="rounded-lg bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]">
                    Save plan
                  </button>
                  <button type="submit" formAction={deletePlan} className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                    Delete plan
                  </button>
                </div>
              </form>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
