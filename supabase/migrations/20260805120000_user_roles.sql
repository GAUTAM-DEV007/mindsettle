-- Role-based access control for Mindsettle.
-- Run this in the Supabase SQL Editor (or `supabase db push` if you use the CLI).
-- Safe to re-run: every statement is idempotent.

-- 1. The table that /post-login, /admin, /organisation-dashboard and
--    proxy.js all already query.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'organisation', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Each user can read their own role (needed by client-side reads, if any;
-- server-side reads in Server Components/proxy already use the same
-- policy since they run as the logged-in user via the anon key + cookies).
drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy for regular users on purpose: role
-- assignment only happens via the trigger below (as postgres, bypassing
-- RLS) or manually by you in the SQL editor. This stops a user from ever
-- setting their own role to 'admin' through the API.

-- 2. Auto-create a role row the moment someone signs up, so /post-login
--    never hits "role-not-found" for a brand-new account.
--    AuthForm.js passes `options.data.requested_role` on signUp() for the
--    organisation flow; plain user signups omit it and default to 'user'.
--    Note: 'admin' is intentionally never read from user metadata here --
--    promote someone to admin by running
--      update public.user_roles set role = 'admin' where user_id = '<uuid>';
--    yourself, so nobody can self-assign admin through the signup form.
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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Backfill: if you already have test accounts from before this
--    migration existed, give them a default role so they don't get stuck
--    on "role-not-found" the next time they log in.
insert into public.user_roles (user_id, role)
select id, 'user' from auth.users
on conflict (user_id) do nothing;
