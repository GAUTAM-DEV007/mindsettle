-- Update subscription_plans pricing to be informed by real market
-- comparables, instead of the original placeholder numbers.
-- Run in the Supabase SQL editor after 20260819000000_rename_subscription_plans.sql.
-- Safe to re-run.
--
-- Sources (as of Aug 2026):
--   Calm (calm.com)   -- direct comparable: guided calm/wellness content,
--                         same category as MindSettle's Individual plan.
--                         Monthly $16.99, Annual $69.99 (~$5.83/mo effective).
--   Netflix           -- NOT a direct comparable (general entertainment,
--                         not wellness content, no seat-based B2B product),
--                         but its "Extra Member" add-on ($7.99-$9.99/seat/mo)
--                         is a reasonable real-world anchor for per-seat
--                         pricing on the Organisation plans, since neither
--                         Calm nor Netflix actually sells enterprise/seat
--                         licenses. These org figures are still an estimate
--                         built from that anchor plus typical SaaS volume
--                         discounting -- update from Admin -> Plan
--                         Management once real contracts/quotes exist.

begin;

-- Individual: match Calm's actual monthly price point directly, since
-- MindSettle's individual plan is the same category of product.
update public.subscription_plans
set price_cents = 1699, billing_cycle = 'monthly'
where slug = 'individual-premium';

-- Add the annual option Calm (and most subscription apps) also offer,
-- at Calm's real annual price -- a well-tested anchor in this exact market.
insert into public.subscription_plans (type, name, slug, price_cents, billing_cycle, tier, seat_limit, sort_order, description)
values (
  'individual', 'Individual Premium (Annual)', 'individual-premium-annual',
  6999, 'yearly', 1, null, 2,
  'Save compared to monthly -- billed once a year.'
)
on conflict (slug) do update set
  price_cents = excluded.price_cents,
  billing_cycle = excluded.billing_cycle;

-- Organisation: per-seat rate anchored to Netflix's real extra-member
-- price ($7.99-$9.99/seat/mo), with standard SaaS volume discounting
-- applied at higher seat counts. Monthly only -- enterprise/aged-care
-- contracts are typically negotiated and invoiced annually rather than
-- self-serve, so an annual toggle here would imply a self-serve price
-- that doesn't reflect how these deals are actually made.
update public.subscription_plans set price_cents = 19900 where slug = 'organisation-starter';       -- 20 seats  x $9.95/seat
update public.subscription_plans set price_cents = 39900 where slug = 'organisation-professional';  -- 50 seats  x $7.98/seat (~20% off)
update public.subscription_plans set price_cents = 69900 where slug = 'organisation-enterprise';     -- 100 seats x $6.99/seat (~30% off)

commit;
