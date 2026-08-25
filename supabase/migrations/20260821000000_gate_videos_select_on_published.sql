-- The live "Videos are viewable by authenticated users" policy is
-- unconditional (using true), so an unpublished/draft video's row (title,
-- description, thumbnail_url, video_url) is currently visible to every
-- signed-in user via the videos table -- not just admins previewing it.
-- The actual video FILE is already protected separately by the
-- entitlement-aware storage policy, but the metadata leak is still a real
-- gap: replace it with the is_published-gated version admins already get
-- a bypass for.
-- Run in the Supabase SQL Editor after 20260820000000_update_plan_pricing.sql.
-- Safe to re-run.

begin;

drop policy if exists "Videos are viewable by authenticated users" on public.videos;
drop policy if exists "Published videos and admin catalogue" on public.videos;
create policy "Published videos and admin catalogue"
  on public.videos for select to authenticated
  using (
    is_published
    or exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

commit;
