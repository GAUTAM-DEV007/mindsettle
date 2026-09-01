-- Variable organisation seats and graduated per-seat subscriptions.
-- Run after 20260820000000_update_plan_pricing.sql.
--
-- Stripe setup required for `organisation-flex`:
--   recurring, monthly, licensed, graduated pricing in USD
--   seats   1-20: $9.95 each
--   seats  21-50: $6.67 each
--   seats 51-100: $6.00 each
--   seats    101+: $5.50 each
-- Add that Stripe Price ID to organisation-flex in Admin -> Plan Management.

begin;

alter table public.subscriptions
  add column if not exists seat_quantity integer;

update public.subscriptions
set seat_quantity = 1
where seat_quantity is null;

-- Preserve the purchased capacity implied by legacy fixed-seat plans.
update public.subscriptions s
set seat_quantity = p.seat_limit
from public.subscription_plans p
where s.plan_id = p.id
  and p.type = 'organisation'
  and p.seat_limit is not null
  and s.seat_quantity = 1;

alter table public.subscriptions
  alter column seat_quantity set default 1,
  alter column seat_quantity set not null;

alter table public.subscriptions
  drop constraint if exists subscriptions_seat_quantity_check;

alter table public.subscriptions
  add constraint subscriptions_seat_quantity_check
  check (seat_quantity > 0);

-- A single organisation plan now controls content entitlement while Stripe's
-- graduated Price controls the charge for the selected quantity.
insert into public.subscription_plans (
  type,
  name,
  slug,
  description,
  price_cents,
  currency,
  billing_cycle,
  stripe_price_id,
  seat_limit,
  tier,
  is_active,
  sort_order
)
values (
  'organisation',
  'Organisation Flexible',
  'organisation-flex',
  'Choose the member accounts you need and receive automatic graduated volume discounts.',
  995,
  'usd',
  'monthly',
  null,
  null,
  3,
  true,
  3
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  billing_cycle = excluded.billing_cycle,
  seat_limit = excluded.seat_limit,
  tier = excluded.tier,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Keep legacy rows for existing subscription foreign keys, but stop offering
-- them to new organisations.
update public.subscription_plans
set is_active = false
where slug in (
  'organisation-starter',
  'organisation-professional',
  'organisation-enterprise'
);

commit;

