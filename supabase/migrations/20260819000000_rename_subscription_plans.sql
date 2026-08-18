-- Rename plans -> subscription_plans to match the agreed naming, and add
-- subscriptions.organisation_id per the subscription-ownership spec.
-- Run in the Supabase SQL editor after 20260818000000_plans_and_entitlements.sql.
-- Safe to re-run.

begin;

-- ---------------------------------------------------------------------------
-- Rename the table. Postgres keeps indexes, RLS policies, triggers and the
-- subscriptions.plan_id foreign key attached (they're bound by OID, not
-- name), so nothing else needs to be recreated for those.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'plans'
  ) then
    alter table public.plans rename to subscription_plans;
  end if;
end $$;

-- The function body below has a literal "public.plans" reference, which
-- resolves by name at call time -- it must be redefined to point at the
-- new table name, or every entitlement check (and the storage RLS policy
-- that calls it) starts failing.
create or replace function public.user_has_active_entitlement(required_tier integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if required_tier <= 0 then
    return true;
  end if;

  if exists (
    select 1
    from public.subscriptions s
    join public.subscription_plans p on p.id = s.plan_id
    where s.user_id = auth.uid()
      and s.status in ('active', 'trialing')
      and p.tier >= required_tier
  ) then
    return true;
  end if;

  return exists (
    select 1
    from public.organisation_members om
    join public.subscriptions s on s.user_id = om.organisation_id
    join public.subscription_plans p on p.id = s.plan_id
    where om.user_id = auth.uid()
      and om.status = 'active'
      and s.status in ('active', 'trialing')
      and p.tier >= required_tier
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- subscriptions.organisation_id
-- ---------------------------------------------------------------------------
-- MindSettle has no separate `organisations` table -- an organisation is a
-- profiles/auth.users row with user_roles.role = 'organisation', same as
-- everyone else. So a subscription's real owner is always `user_id`
-- (individual or organisation account alike), and that's how checkout, the
-- Stripe webhook, entitlement checks and the billing/admin pages already
-- read and write it -- changing that would break a lot of working code for
-- no functional gain, since there's no second table to point to.
--
-- `organisation_id` is added to satisfy the "subscription belongs to a
-- user OR an organisation, never both" requirement in a way that's
-- additive rather than a rewrite: when set, it must equal the row's own
-- user_id (i.e. "this subscription's owner is, in fact, an organisation
-- account"), which is exactly the invariant that check enforces, without
-- inventing a second identity column that would fight the existing data
-- model.
alter table public.subscriptions add column if not exists organisation_id uuid references public.profiles (id);

alter table public.subscriptions drop constraint if exists subscriptions_organisation_id_matches_user_id;
alter table public.subscriptions add constraint subscriptions_organisation_id_matches_user_id
  check (organisation_id is null or organisation_id = user_id);

create index if not exists subscriptions_organisation_id_idx on public.subscriptions (organisation_id);

-- Let an organisation read its own subscription via either column.
drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription"
  on public.subscriptions for select to authenticated
  using (auth.uid() = user_id or auth.uid() = organisation_id);

-- Backfill: mark existing subscriptions whose owner is an organisation
-- account, so the new column is actually useful immediately rather than
-- staying null for pre-existing rows.
update public.subscriptions s
set organisation_id = s.user_id
where s.organisation_id is null
  and exists (
    select 1 from public.user_roles r
    where r.user_id = s.user_id and r.role = 'organisation'
  );

commit;
