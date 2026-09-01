-- Track a subscription that's scheduled to cancel at the end of its
-- current billing period, rather than immediately. Lets self-service
-- cancel keep the subscriber's access through what they already paid
-- for (standard SaaS practice), instead of cutting access off the
-- instant they click Cancel.
--
-- `status` is left untouched by this column -- it stays 'active'/
-- 'trialing' (and access stays granted, per
-- public.user_has_active_entitlement) right up until Stripe actually
-- ends the subscription at period end, at which point the existing
-- webhook handler (customer.subscription.deleted /
-- customer.subscription.updated) already transitions status to
-- 'canceled' on its own -- no change needed there.
--
-- Run in the Supabase SQL editor after 20260821020000_remove_test_subscription_plan.sql.
-- Safe to re-run.

begin;

alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;

commit;
