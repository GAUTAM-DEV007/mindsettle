-- Role-based access control for Mindsettle.
-- Run this in the Supabase SQL Editor (or `supabase db push` if you use the CLI).
-- Safe to re-run: every statement is idempotent.
--
-- This mirrors what database-schema.sql / admin-dashboard-schema.sql
-- already set up directly on the live project (app_role enum, user_roles
-- table, handle_new_user_role trigger), so a fresh environment bootstrapped
-- from `supabase/migrations` ends up in the same state. It intentionally
-- does NOT touch handle_new_user() -- that function creates the `profiles`
-- row on signup and must stay separate from role assignment, otherwise
-- new signups stop getting a profiles row.

do $$ begin
  create type app_role as enum ('user', 'organisation', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can view their own role" on public.user_roles;
create policy "Users can view their own role"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy for regular users on purpose: role
-- assignment only happens via the trigger below (as postgres, bypassing
-- RLS) or manually by an admin in the SQL editor. This stops a user from
-- ever setting their own role to 'admin' through the API.

-- Auto-create a role row the moment someone signs up, so /post-login
-- never hits "role-not-found" for a brand-new account. AuthForm.js
-- passes options.data.requested_role on signUp() for the organisation
-- flow; plain user signups omit it and default to 'user'. 'admin' is
-- intentionally never read from user metadata here -- promote someone
-- to admin by running
--   update public.user_roles set role = 'admin' where user_id = '<uuid>';
-- yourself, so nobody can self-assign admin through the signup form.
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := new.raw_user_meta_data ->> 'requested_role';
begin
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when requested = 'organisation' then 'organisation'::app_role else 'user'::app_role end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_role_created on auth.users;
create trigger on_auth_user_role_created
  after insert on auth.users
  for each row execute function public.handle_new_user_role();

-- Backfill: give any pre-existing accounts a default role so they don't
-- get stuck on "role-not-found" the next time they log in.
insert into public.user_roles (user_id, role)
select id, 'user' from auth.users
on conflict (user_id) do nothing;
