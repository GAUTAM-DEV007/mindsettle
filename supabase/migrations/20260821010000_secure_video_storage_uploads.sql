-- Two leftover dashboard-generated policies on the "videos" storage
-- bucket ("Allow authenticated uploads 1livt5k_0" and "Allow
-- authenticiated users to read the videos 1livt5k_0", typo included)
-- grant unconditional access to bucket_id = 'videos' for any
-- authenticated user -- not just admins. RLS policies are OR'd together,
-- so these coexist with (and undermine) the entitlement-aware
-- "Mindsettle published media read" policy from
-- 20260818000000_plans_and_entitlements.sql: any signed-in user can
-- currently upload into the bucket, and read any object in it, tier
-- checks and publish status notwithstanding.
--
-- components/admin/MediaUploader.jsx uploads using the signed-in admin's
-- own session (lib/supabase/client.js), not a service-role client, so
-- simply dropping the insert policy would break admin uploads. Replace
-- both leftover policies with admin-gated equivalents instead of just
-- deleting them.
-- Run in the Supabase SQL Editor after 20260821000000_gate_videos_select_on_published.sql.
-- Safe to re-run.

begin;

drop policy if exists "Allow authenticated uploads 1livt5k_0" on storage.objects;
drop policy if exists "Allow authenticiated users to read the videos 1livt5k_0" on storage.objects;

drop policy if exists "Mindsettle admin media insert" on storage.objects;
create policy "Mindsettle admin media insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'videos' and exists (
    select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'
  )
);

drop policy if exists "Mindsettle admin media update" on storage.objects;
create policy "Mindsettle admin media update" on storage.objects for update to authenticated using (
  bucket_id = 'videos' and exists (
    select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'
  )
) with check (
  bucket_id = 'videos' and exists (
    select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'
  )
);

drop policy if exists "Mindsettle admin media delete" on storage.objects;
create policy "Mindsettle admin media delete" on storage.objects for delete to authenticated using (
  bucket_id = 'videos' and exists (
    select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'
  )
);

commit;
