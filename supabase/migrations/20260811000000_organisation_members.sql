-- Organisation member management.
-- Run this in the Supabase SQL Editor after 20260805120000_user_roles.sql.
-- Safe to re-run: every statement is idempotent.

create table if not exists public.organisation_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  invited_at timestamptz not null default now(),
  unique (organisation_id, email)
);

alter table public.organisation_members enable row level security;

-- An organisation account can read/add/remove only the members it invited.
drop policy if exists "Organisations manage their own members" on public.organisation_members;
create policy "Organisations manage their own members"
  on public.organisation_members
  for all
  using (auth.uid() = organisation_id)
  with check (auth.uid() = organisation_id);

-- Auto-activate a pending invite the moment the invited person signs up, so
-- an organisation doesn't have to manually reconcile emails to accounts.
-- This replaces (extends) the trigger function from
-- 20260805120000_user_roles.sql rather than adding a second trigger on
-- auth.users -- the existing `on_auth_user_created` trigger already points
-- at this function name.
create or replace function public.handle_new_user()
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
    case when requested = 'organisation' then 'organisation' else 'user' end
  )
  on conflict (user_id) do nothing;

  update public.organisation_members
  set user_id = new.id, status = 'active'
  where lower(email) = lower(new.email) and status = 'pending';

  return new;
end;
$$;
