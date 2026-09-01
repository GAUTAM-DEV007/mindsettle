-- Apply after 20260828000000_organisation_member_onboarding.sql.
-- Free playback is reserved atomically and enforced by Storage RLS, not by
-- editable watch history or client-side counters. Existing claims are kept.
begin;

create table if not exists public.free_video_claims (
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.free_video_claims enable row level security;
revoke all on public.free_video_claims from anon, authenticated;
grant select on public.free_video_claims to authenticated;
drop policy if exists "Users read their free video claims" on public.free_video_claims;
create policy "Users read their free video claims"
  on public.free_video_claims for select to authenticated
  using (user_id = auth.uid());

insert into public.free_video_claims (user_id, video_id)
select distinct wh.user_id, wh.video_id
from public.watch_history wh
join public.videos v on v.id = wh.video_id
where v.min_tier = 0
on conflict do nothing;

create or replace function public.user_has_active_entitlement(required_tier integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or
    coalesce(auth.jwt()->'app_metadata'->>'must_change_password', 'false') = 'true' then
    return false;
  end if;

  if required_tier <= 0 then return true; end if;

  if exists (
    select 1 from public.subscriptions s
    join public.subscription_plans p on p.id = s.plan_id
    where s.user_id = auth.uid()
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
      and p.tier >= required_tier
  ) then return true; end if;

  return exists (
    select 1 from public.organisation_members om
    join public.subscriptions s on s.user_id = om.organisation_id
    join public.subscription_plans p on p.id = s.plan_id
    where om.user_id = auth.uid() and om.status = 'active'
      and p.type = 'organisation'
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
      and p.tier >= required_tier
  );
end;
$$;
revoke all on function public.user_has_active_entitlement(integer) from public, anon;
grant execute on function public.user_has_active_entitlement(integer) to authenticated;

create or replace function public.claim_free_video(target_video_id uuid)
returns table (allowed boolean, free_views_remaining integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  viewer_id uuid := auth.uid();
  used_count integer;
begin
  if viewer_id is null or
    coalesce(auth.jwt()->'app_metadata'->>'must_change_password', 'false') = 'true' then
    raise exception using errcode = '42501', message = 'completed_login_required';
  end if;

  if not exists (
    select 1 from public.videos v
    where v.id = target_video_id and v.is_published and v.min_tier = 0
  ) then
    raise exception using errcode = '22023', message = 'free_video_not_available';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('free-video:' || viewer_id::text, 0));
  select count(*)::integer into used_count
  from public.free_video_claims c where c.user_id = viewer_id;

  if exists (
    select 1 from public.free_video_claims c
    where c.user_id = viewer_id and c.video_id = target_video_id
  ) then
    return query select true, greatest(3 - used_count, 0);
    return;
  end if;

  if used_count >= 3 then
    return query select false, 0;
    return;
  end if;

  insert into public.free_video_claims(user_id, video_id)
  values (viewer_id, target_video_id);
  insert into public.watch_history(user_id, video_id)
  values (viewer_id, target_video_id)
  on conflict (user_id, video_id) do nothing;

  return query select true, greatest(2 - used_count, 0);
end;
$$;
revoke all on function public.claim_free_video(uuid) from public, anon;
grant execute on function public.claim_free_video(uuid) to authenticated;

drop policy if exists "Mindsettle published media read" on storage.objects;
create policy "Mindsettle published media read"
on storage.objects for select to authenticated using (
  bucket_id = 'videos'
  and coalesce(auth.jwt()->'app_metadata'->>'must_change_password', 'false') <> 'true'
  and (
    exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')
    or exists (
      select 1 from public.videos v
      where v.is_published and (
        -- Catalogue thumbnails are public to signed-in users, but must not
        -- double as a way to retrieve the main media source.
        (v.thumbnail_url = name and v.video_url is distinct from name)
        or (v.video_url = name and (
          (v.min_tier > 0 and public.user_has_active_entitlement(v.min_tier))
          or (v.min_tier = 0 and (
            public.user_has_active_entitlement(1)
            or exists (
              select 1 from public.free_video_claims c
              where c.user_id = auth.uid() and c.video_id = v.id
            )
          ))
        ))
      )
    )
  )
);

-- Trigger functions are invoked by their triggers, never via the public API.
-- The two authenticated RPCs above intentionally retain EXECUTE grants.
do $$
declare function_name text;
begin
  foreach function_name in array array[
    'public.handle_new_user()',
    'public.handle_new_user_role()',
    'public.link_existing_organisation_member()',
    'public.rls_auto_enable()'
  ] loop
    if to_regprocedure(function_name) is not null then
      execute format('revoke all on function %s from public, anon, authenticated', function_name);
    end if;
  end loop;
end;
$$;

commit;
