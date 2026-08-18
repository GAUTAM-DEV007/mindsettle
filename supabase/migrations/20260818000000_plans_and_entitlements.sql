-- Plans + content-tier entitlement system for MindSettle M5.
-- Run in the Supabase SQL editor after 20260815000000_platform_hardening.sql.
-- Safe to re-run: every statement is idempotent.

begin;

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------
-- `tier` is a simple integer ladder (0 = free, 1+ = paid). A video's
-- `min_tier` is the lowest plan tier that unlocks it, so higher-tier
-- organisation plans (e.g. Enterprise) can unlock content that a lower
-- tier (e.g. Starter) can't, without a separate many-to-many table.

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('individual', 'organisation')),
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'usd',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  stripe_price_id text,
  seat_limit integer check (seat_limit is null or seat_limit > 0),
  tier integer not null default 1 check (tier >= 1),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_plans_updated_at on public.plans;
create trigger set_plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

alter table public.plans enable row level security;

drop policy if exists "Plans are viewable by signed in users" on public.plans;
create policy "Plans are viewable by signed in users"
  on public.plans for select to authenticated using (true);

drop policy if exists "Admins manage plans" on public.plans;
create policy "Admins manage plans"
  on public.plans for all to authenticated
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'))
  with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

-- Starting example plans -- edit prices/seat limits/names from
-- Admin -> Plan Management. Not permanent hard-coded values.
insert into public.plans (type, name, slug, price_cents, billing_cycle, tier, seat_limit, sort_order)
values
  ('individual', 'Individual Premium', 'individual-premium', 999, 'monthly', 1, null, 1),
  ('organisation', 'Organisation Starter', 'organisation-starter', 19900, 'monthly', 1, 20, 2),
  ('organisation', 'Organisation Professional', 'organisation-professional', 49900, 'monthly', 2, 50, 3),
  ('organisation', 'Organisation Enterprise', 'organisation-enterprise', 99900, 'monthly', 3, 100, 4)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- subscriptions.plan_id -- links the free-text `plan` column to a real plan
-- ---------------------------------------------------------------------------

alter table public.subscriptions add column if not exists plan_id uuid references public.plans (id);
create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);

-- ---------------------------------------------------------------------------
-- videos.min_tier -- 0 = free, 1+ = requires a subscription at that tier
-- ---------------------------------------------------------------------------

alter table public.videos add column if not exists min_tier integer not null default 0;

-- One-time backfill from the existing is_premium flag. Only touches rows
-- still at the fresh column's default so re-running this migration won't
-- clobber tiers an admin has since customised.
update public.videos set min_tier = 1 where is_premium and min_tier = 0;

-- ---------------------------------------------------------------------------
-- Entitlement check -- single source of truth, used by both the storage RLS
-- policy below and the app's entitlement module (via rpc()), so the rule
-- only lives in one place. Always checks the calling user (auth.uid()),
-- never a passed-in id, so it can't be used to probe another user's
-- subscription status.
-- ---------------------------------------------------------------------------

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
    join public.plans p on p.id = s.plan_id
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
    join public.plans p on p.id = s.plan_id
    where om.user_id = auth.uid()
      and om.status = 'active'
      and s.status in ('active', 'trialing')
      and p.tier >= required_tier
  );
end;
$$;

revoke all on function public.user_has_active_entitlement(integer) from public;
revoke all on function public.user_has_active_entitlement(integer) from anon;
grant execute on function public.user_has_active_entitlement(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage RLS: premium media now requires a real entitlement, not just
-- is_published. This is the actual security boundary -- app-layer checks
-- are UX, this is what stops a signed URL being requested directly.
-- The 3-free-video counter is intentionally NOT enforced here (it's a
-- metering/UX rule, not a payment boundary) -- it's enforced in the app
-- layer via lib/access/entitlement.js against watch_history.
-- ---------------------------------------------------------------------------

drop policy if exists "Mindsettle published media read" on storage.objects;
create policy "Mindsettle published media read" on storage.objects for select to authenticated using (
  bucket_id = 'videos' and (
    exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')
    or exists (
      select 1 from public.videos v
      where v.is_published
        and (v.video_url = name or v.thumbnail_url = name)
        and (v.min_tier = 0 or public.user_has_active_entitlement(v.min_tier))
    )
  )
);

commit;
