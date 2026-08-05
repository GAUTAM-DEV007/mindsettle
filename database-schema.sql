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

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists videos_category_id_idx on videos (category_id);
create index if not exists favourites_user_id_idx on favourites (user_id);
create index if not exists favourites_video_id_idx on favourites (video_id);
create index if not exists watch_history_user_id_idx on watch_history (user_id);
create index if not exists watch_history_video_id_idx on watch_history (video_id);
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);

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

-- Auto-create a user_roles row (default 'user') whenever a new user
-- signs up via Supabase Auth.
create or replace function handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_role_created on auth.users;
create trigger on_auth_user_role_created
  after insert on auth.users
  for each row execute function handle_new_user_role();

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
alter table favourites enable row level security;
alter table watch_history enable row level security;
alter table subscriptions enable row level security;

-- categories: public read-only catalog data. Writes are done by admins
-- using the service role key, which bypasses RLS.
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

-- videos: catalog metadata is readable by any signed-in user; the app's
-- proxy/layout already gates the /library routes behind auth. Writes are
-- done by admins using the service role key.
create policy "Videos are viewable by authenticated users"
  on videos for select
  to authenticated
  using (true);

create policy "Admins can insert videos"
  on videos for insert
  to authenticated
  with check (
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

-- subscriptions: users can read their own subscription status only. All
-- writes happen server-side via the billing webhook using the service
-- role key, so no insert/update/delete policies are defined here.
create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

commit;
