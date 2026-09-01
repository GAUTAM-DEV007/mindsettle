-- Organisation-admin member onboarding with atomic seat enforcement.
-- Run after 20260826000000_organisation_seat_subscriptions.sql.

begin;

-- A newly-created organisation member must change the temporary password
-- before the membership becomes active. Existing users linked by email can
-- remain active immediately because they already control their credentials.
alter table public.organisation_members
  add column if not exists temporary_password_issued_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.organisation_members
  drop constraint if exists organisation_members_status_check;

alter table public.organisation_members
  add constraint organisation_members_status_check
  check (status in ('pending', 'invited', 'active'));

-- Email matching is case-insensitive throughout the onboarding flow.
create unique index if not exists organisation_members_organisation_email_lower_key
  on public.organisation_members (organisation_id, lower(email));

-- Keep role creation and invitation linking in one auth trigger. Accounts
-- created with a temporary password remain `invited` until the password-change
-- action clears their protected app_metadata flag.
create or replace function public.handle_new_user_role()
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

-- Existing accounts are linked immediately and do not receive a replacement
-- password. New accounts are linked by handle_new_user_role() above.
create or replace function public.link_existing_organisation_member()
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

drop trigger if exists link_existing_organisation_member on public.organisation_members;
create trigger link_existing_organisation_member
  before insert or update of email on public.organisation_members
  for each row execute function public.link_existing_organisation_member();

-- Reserve a member seat and create the invitation row inside one transaction.
-- An advisory transaction lock serialises invitations for the same
-- organisation so two simultaneous requests cannot exceed the purchased cap.
create or replace function public.reserve_organisation_member(member_email text)
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
    select 1
    from public.user_roles r
    where r.user_id = organisation_user_id
      and r.role = 'organisation'
  ) then
    raise exception using errcode = '42501', message = 'organisation_role_required';
  end if;

  if normalized_email is null or normalized_email = ''
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
    and p.type = 'organisation'
    and (s.current_period_end is null or s.current_period_end > now())
  order by s.current_period_end desc nulls last, s.created_at desc
  limit 1;

  if purchased_seats is null then
    raise exception using errcode = 'P0001', message = 'organisation_subscription_required';
  end if;

  if exists (
    select 1
    from public.organisation_members om
    where om.organisation_id = organisation_user_id
      and lower(om.email) = normalized_email
  ) then
    raise exception using errcode = '23505', message = 'member_already_exists';
  end if;

  select count(*)::integer
  into current_allocation
  from public.organisation_members om
  where om.organisation_id = organisation_user_id;

  if current_allocation >= purchased_seats then
    raise exception using errcode = 'P0001', message = 'organisation_seat_limit_reached';
  end if;

  insert into public.organisation_members (organisation_id, email)
  values (organisation_user_id, normalized_email)
  returning * into created_member;

  return query
  select
    created_member.id,
    created_member.user_id,
    created_member.status,
    purchased_seats,
    current_allocation + 1;
end;
$$;

revoke all on function public.reserve_organisation_member(text) from public;
revoke all on function public.reserve_organisation_member(text) from anon;
grant execute on function public.reserve_organisation_member(text) to authenticated;

-- Direct inserts/updates would bypass the atomic seat check. Organisation
-- admins can read and remove their own rows; only the security-definer RPC and
-- trusted server code can create or advance onboarding records.
drop policy if exists "Organisations manage their own members" on public.organisation_members;
drop policy if exists "Organisations view their own members" on public.organisation_members;
drop policy if exists "Organisation members view their membership" on public.organisation_members;
drop policy if exists "Organisations remove their own members" on public.organisation_members;

create policy "Organisations view their own members"
  on public.organisation_members
  for select to authenticated
  using (auth.uid() = organisation_id);

create policy "Organisation members view their membership"
  on public.organisation_members
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Organisations remove their own members"
  on public.organisation_members
  for delete to authenticated
  using (auth.uid() = organisation_id);

commit;
