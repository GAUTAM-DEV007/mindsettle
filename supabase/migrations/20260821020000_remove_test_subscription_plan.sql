-- Removes a stray test row inserted directly into subscription_plans on
-- 2026-08-18 (name "Prabez Aalam", slug "prabez-aalam-msycwpvs",
-- price_cents 0) -- not one of the real plans created by
-- 20260818000000_plans_and_entitlements.sql's seed insert or
-- 20260820000000_update_plan_pricing.sql. It shows up in the admin
-- Plan Management screen and the public pricing list alongside the real
-- plans. Confirmed no subscriptions reference it (plan_id) before
-- deleting.
-- Run in the Supabase SQL Editor after 20260821010000_secure_video_storage_uploads.sql.
-- Safe to re-run.

begin;

delete from public.subscription_plans
where slug = 'prabez-aalam-msycwpvs' and price_cents = 0;

commit;
