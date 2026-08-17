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
--
-- IMPORTANT: this extends handle_new_user_role() (from
-- 20260805120000_user_roles.sql), NOT handle_new_user(). handle_new_user()
-- is a different, separate function/trigger (on_auth_user_created) that
-- creates the `profiles` row on signup -- redefining it here would
-- silently stop new signups from getting a profiles row, breaking the
-- admin analytics user count, the account page, and the media table's
-- uploaded_by FK. handle_new_user_role() already runs on its own
-- on_auth_user_created-independent trigger (on_auth_user_role_created)
-- and already has the requested_role -> role logic this needs.
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

  update public.organisation_members
  set user_id = new.id, status = 'active'
  where lower(email) = lower(new.email) and status = 'pending';

  return new;
end;
$$;
