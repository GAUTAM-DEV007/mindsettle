-- MindSettle admin dashboard analytics
-- Adds a single admin-only RPC function used by the /admin dashboard.
-- Run in the Supabase SQL editor (or via the CLI: supabase db execute -f admin-dashboard-schema.sql)
-- after database-schema.sql and media-schema.sql have already been applied.

begin;

-- Returns platform-wide analytics for the admin dashboard. Runs as
-- security definer so it can aggregate across all users' rows
-- (bypassing the per-user RLS policies on profiles/subscriptions/
-- watch_history), but only after confirming the calling user actually
-- holds the 'admin' role in user_roles.
create or replace function admin_dashboard_analytics(most_watched_limit integer default 10)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (
    select 1 from user_roles
    where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
  ) then
    raise exception 'Admin access required';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from profiles),
    'total_videos', (select count(*) from videos),
    'subscriptions_by_status', jsonb_build_object(
      'active', (select count(*) from subscriptions where status = 'active'),
      'trialing', (select count(*) from subscriptions where status = 'trialing'),
      'canceled', (select count(*) from subscriptions where status = 'canceled')
    ),
    'most_watched_videos', (
      select coalesce(jsonb_agg(ranked), '[]'::jsonb)
      from (
        select
          videos.id as video_id,
          videos.title,
          count(watch_history.id) as watch_count
        from watch_history
        join videos on videos.id = watch_history.video_id
        group by videos.id, videos.title
        order by count(watch_history.id) desc, videos.title asc
        limit greatest(most_watched_limit, 0)
      ) ranked
    )
  )
  into result;

  return result;
end;
$$;

revoke all on function admin_dashboard_analytics(integer) from public;
revoke all on function admin_dashboard_analytics(integer) from anon;
grant execute on function admin_dashboard_analytics(integer) to authenticated;

commit;
