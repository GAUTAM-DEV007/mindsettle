-- MindSettle database schema
-- Run in the Supabase SQL editor (or via the CLI: supabase db execute -f database-schema.sql)

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text,
  category_id uuid references categories (id) on delete set null,
  duration_minutes integer check (duration_minutes > 0),
  thumbnail_url text,
  video_url text,
  is_premium boolean not null default true,
  created_at timestamptz not null default now()
);

-- Added by 20260815000000_platform_hardening.sql (is_featured,
-- show_on_homepage, is_published) and 20260818000000_plans_and_entitlements.sql
-- (min_tier). `alter table ... add column if not exists` so this stays
-- idempotent against a table that may already have these columns.
-- Note: is_published's live default is `true`, not the `false` the
-- migration files declare -- it was flipped by hand directly on the
-- live DB at some point, so newly inserted videos are public by default
-- unless an admin explicitly unpublishes them.
alter table videos add column if not exists is_featured boolean not null default false;
alter table videos add column if not exists show_on_homepage boolean not null default false;
alter table videos add column if not exists is_published boolean not null default true;
alter table videos add column if not exists min_tier integer not null default 0;

-- Extends auth.users with app-facing profile data. Row is created
-- automatically by the handle_new_user trigger below.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type app_role as enum ('user', 'organisation', 'admin');
exception
  when duplicate_object then null;
end $$;

-- One row per auth user, created automatically by the
-- handle_new_user_role trigger below. Drives admin checks elsewhere
-- (e.g. media-schema.sql).
create table if not exists user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Organisation-invited members. A new temporary-password account remains
-- invited until it completes the mandatory password change; existing users
-- linked by email can become active immediately.
create table if not exists organisation_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'invited', 'active')),
  invited_at timestamptz not null default now(),
  temporary_password_issued_at timestamptz,
  onboarding_completed_at timestamptz,
  unique (organisation_id, email)
);

alter table organisation_members
  add column if not exists temporary_password_issued_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz;
alter table organisation_members drop constraint if exists organisation_members_status_check;
alter table organisation_members add constraint organisation_members_status_check
  check (status in ('pending', 'invited', 'active'));

create table if not exists favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  video_id uuid not null references videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  video_id uuid not null references videos (id) on delete cascade,
  progress_seconds integer not null default 0 check (progress_seconds >= 0),
  completed boolean not null default false,
  watched_at timestamptz not null default now(),
  unique (user_id, video_id)
);

-- Written by the billing webhook (service role) once a payment provider
-- (e.g. Stripe) confirms a subscription event. Not writable by end users.
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Added by 20260818000000_plans_and_entitlements.sql and
-- 20260819000000_rename_subscription_plans.sql. `plan_id` points at
-- `subscription_plans`, a table owned by that plan/entitlement system
-- rather than this core schema, so it isn't redefined here -- only the
-- FK column that lives on `subscriptions`. The FK itself is added via a
-- guarded DO block rather than inline, since this file is meant to run
-- before subscription_plans exists (it's created by a later migration);
-- an inline `references subscription_plans (id)` would fail on a fresh
-- database. `organisation_id`, when set, must equal the row's own
-- `user_id` (see the check constraint below): MindSettle has no separate
-- organisations table, an organisation is a profiles/auth.users row with
-- user_roles.role = 'organisation', so this documents "this
-- subscription's owner is an organisation account" rather than pointing
-- at a second entity.
alter table subscriptions add column if not exists plan_id uuid;
alter table subscriptions add column if not exists organisation_id uuid references profiles (id);
alter table subscriptions add column if not exists seat_quantity integer not null default 1;

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'subscription_plans')
    and not exists (select 1 from pg_constraint where conname = 'subscriptions_plan_id_fkey')
  then
    alter table subscriptions add constraint subscriptions_plan_id_fkey foreign key (plan_id) references subscription_plans (id);
  end if;
end $$;
alter table subscriptions drop constraint if exists subscriptions_organisation_id_matches_user_id;
alter table subscriptions add constraint subscriptions_organisation_id_matches_user_id
  check (organisation_id is null or organisation_id = user_id);
alter table subscriptions drop constraint if exists subscriptions_seat_quantity_check;
alter table subscriptions add constraint subscriptions_seat_quantity_check
  check (seat_quantity > 0);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists videos_category_id_idx on videos (category_id);
create index if not exists organisation_members_organisation_id_idx on organisation_members (organisation_id);
create unique index if not exists organisation_members_organisation_email_lower_key
  on organisation_members (organisation_id, lower(email));
create index if not exists favourites_user_id_idx on favourites (user_id);
create index if not exists favourites_video_id_idx on favourites (video_id);
create index if not exists watch_history_user_id_idx on watch_history (user_id);
create index if not exists watch_history_video_id_idx on watch_history (video_id);
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);
create index if not exists subscriptions_plan_id_idx on subscriptions (plan_id);
create index if not exists subscriptions_organisation_id_idx on subscriptions (organisation_id);
create index if not exists videos_published_created_idx on videos (is_published, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Auto-create a profile row whenever a new user signs up via Supabase Auth.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-create a user_roles row whenever a new user signs up via
-- Supabase Auth. AuthForm.js passes options.data.requested_role on
-- signUp() for the organisation registration flow; plain signups omit
-- it and default to 'user'. 'admin' is intentionally never read from
-- user metadata, so nobody can self-assign admin through the signup
-- form -- promote someone by running
--   update user_roles set role = 'admin' where user_id = '<uuid>';
-- yourself.
create or replace function handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := new.raw_user_meta_data ->> 'requested_role';
  requires_password_change boolean := coalesce(
    (new.raw_app_meta_data ->> 'must_change_password')::boolean,
    false
  );
begin
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when requested = 'organisation' then 'organisation'::app_role else 'user'::app_role end
  )
  on conflict (user_id) do nothing;

  -- Temporary-password accounts stay invited until their first password
  -- change. Ordinary signups that match an invitation activate immediately.
  update public.organisation_members
  set
    user_id = new.id,
    status = case when requires_password_change then 'invited' else 'active' end,
    temporary_password_issued_at = case
      when requires_password_change then coalesce(temporary_password_issued_at, now())
      else temporary_password_issued_at
    end,
    onboarding_completed_at = case
      when requires_password_change then null
      else coalesce(onboarding_completed_at, now())
    end
  where lower(email) = lower(new.email)
    and status in ('pending', 'invited');

  return new;
end;
$$;

drop trigger if exists on_auth_user_role_created on auth.users;
create trigger on_auth_user_role_created
  after insert on auth.users
  for each row execute function handle_new_user_role();

-- Link an invitation immediately when the address already belongs to an
-- account. That user keeps their existing password and is active straight
-- away.
create or replace function link_existing_organisation_member()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  existing_user_id uuid;
begin
  select id into existing_user_id
  from auth.users
  where lower(email) = lower(new.email)
  limit 1;

  if existing_user_id is not null then
    new.user_id := existing_user_id;
    new.status := 'active';
    new.onboarding_completed_at := coalesce(new.onboarding_completed_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists link_existing_organisation_member on organisation_members;
create trigger link_existing_organisation_member
  before insert or update of email on organisation_members
  for each row execute function link_existing_organisation_member();

-- Atomically reserve a purchased seat. This is the only supported insert
-- path for organisation admins, preventing concurrent requests from
-- over-allocating their subscription.
create or replace function reserve_organisation_member(member_email text)
returns table (
  member_id uuid,
  linked_user_id uuid,
  member_status text,
  seat_limit integer,
  allocated_seats integer
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  organisation_user_id uuid := auth.uid();
  normalized_email text := lower(trim(member_email));
  purchased_seats integer;
  current_allocation integer;
  created_member public.organisation_members%rowtype;
begin
  if organisation_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if not exists (
    select 1 from public.user_roles r
    where r.user_id = organisation_user_id and r.role = 'organisation'
  ) then
    raise exception using errcode = '42501', message = 'organisation_role_required';
  end if;

  if normalized_email = ''
    or length(normalized_email) > 320
    or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception using errcode = '22023', message = 'invalid_member_email';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(organisation_user_id::text, 0));

  select coalesce(s.seat_quantity, p.seat_limit)
  into purchased_seats
  from public.subscriptions s
  join public.subscription_plans p on p.id = s.plan_id
  where s.user_id = organisation_user_id
    and s.status in ('active', 'trialing')
  order by s.current_period_end desc nulls last, s.created_at desc
  limit 1;

  if purchased_seats is null then
    raise exception using errcode = 'P0001', message = 'organisation_subscription_required';
  end if;

  if exists (
    select 1 from public.organisation_members om
    where om.organisation_id = organisation_user_id
      and lower(om.email) = normalized_email
  ) then
    raise exception using errcode = '23505', message = 'member_already_exists';
  end if;

  select count(*)::integer into current_allocation
  from public.organisation_members om
  where om.organisation_id = organisation_user_id;

  if current_allocation >= purchased_seats then
    raise exception using errcode = 'P0001', message = 'organisation_seat_limit_reached';
  end if;

  insert into public.organisation_members (organisation_id, email)
  values (organisation_user_id, normalized_email)
  returning * into created_member;

  return query select
    created_member.id,
    created_member.user_id,
    created_member.status,
    purchased_seats,
    current_allocation + 1;
end;
$$;

revoke all on function reserve_organisation_member(text) from public;
revoke all on function reserve_organisation_member(text) from anon;
grant execute on function reserve_organisation_member(text) to authenticated;

-- Keep updated_at current on profiles and subscriptions.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists set_subscriptions_updated_at on subscriptions;
create trigger set_subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table categories enable row level security;
alter table videos enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table organisation_members enable row level security;
alter table favourites enable row level security;
alter table watch_history enable row level security;
alter table subscriptions enable row level security;

-- categories: read-only for everyone; writes are gated to admins so the
-- /admin categories manager can insert/update/delete directly under RLS.
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

create policy "Admins can insert categories"
  on categories for insert
  to authenticated
  with check (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

create policy "Admins can update categories"
  on categories for update
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

create policy "Admins can delete categories"
  on categories for delete
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

-- videos: catalog metadata is readable by any signed-in user for
-- published videos; admins can also see unpublished/draft rows so they
-- can preview before publishing. Writes are gated to admins so the
-- /admin videos manager can insert/update/delete directly under RLS.
drop policy if exists "Videos are viewable by authenticated users" on videos;
create policy "Published videos and admin catalogue"
  on videos for select
  to authenticated
  using (
    is_published
    or exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

create policy "Admins can insert videos"
  on videos for insert
  to authenticated
  with check (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

create policy "Admins can update videos"
  on videos for update
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

create policy "Admins can delete videos"
  on videos for delete
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

-- profiles: users can only see and manage their own profile.
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_roles: users can read only their own role. All writes happen via
-- the handle_new_user_role trigger or the service role key, so no
-- insert/update/delete policies are defined here.
create policy "Users can view their own role"
  on user_roles for select
  using (auth.uid() = user_id);

-- organisation_members: reads and removals are scoped to the organisation.
-- Inserts go through reserve_organisation_member() so the seat cap is atomic.
create policy "Organisations view their own members"
  on organisation_members for select
  using (auth.uid() = organisation_id);

create policy "Organisation members view their membership"
  on organisation_members for select
  using (auth.uid() = user_id);

create policy "Organisations remove their own members"
  on organisation_members for delete
  using (auth.uid() = organisation_id);

-- favourites: users manage only their own favourites.
create policy "Users can view their own favourites"
  on favourites for select
  using (auth.uid() = user_id);

create policy "Users can add their own favourites"
  on favourites for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own favourites"
  on favourites for delete
  using (auth.uid() = user_id);

-- watch_history: users manage only their own history.
create policy "Users can view their own watch history"
  on watch_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own watch history"
  on watch_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own watch history"
  on watch_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own watch history"
  on watch_history for delete
  using (auth.uid() = user_id);

-- subscriptions: users can read their own subscription status only, and
-- an organisation account can read it via either column since
-- organisation_id (when set) always equals its own user_id. All writes
-- happen server-side via the billing webhook using the service role
-- key, so no insert/update/delete policies are defined here.
drop policy if exists "Users can view their own subscription" on subscriptions;
create policy "Users can view their own subscription"
  on subscriptions for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = organisation_id);

commit;
