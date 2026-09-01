-- Read-only snapshot of exactly the objects changed by the 26/28/31 August
-- migrations. Save the returned JSON outside version control before applying.
-- This is NOT a full-project backup: no auth credentials or media are exported.
select jsonb_build_object(
  'captured_at', now(),
  'database', current_database(),
  'functions', (select jsonb_agg(jsonb_build_object(
    'signature', p.oid::regprocedure::text,
    'definition', pg_get_functiondef(p.oid),
    'owner', pg_get_userbyid(p.proowner),
    'acl', p.proacl::text
  ) order by p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in (
      'handle_new_user','handle_new_user_role','link_existing_organisation_member',
      'rls_auto_enable','user_has_active_entitlement','reserve_organisation_member','claim_free_video')),
  'policies', (select jsonb_agg(to_jsonb(p) order by p.schemaname,p.tablename,p.policyname)
    from pg_policies p where (schemaname='public' and tablename='organisation_members')
      or (schemaname='storage' and tablename='objects' and policyname='Mindsettle published media read')),
  'member_constraints', (select jsonb_agg(jsonb_build_object('name',conname,'definition',pg_get_constraintdef(oid)))
    from pg_constraint where conrelid='public.organisation_members'::regclass),
  'member_triggers', (select jsonb_agg(pg_get_triggerdef(oid)) from pg_trigger
    where tgrelid='public.organisation_members'::regclass and not tgisinternal),
  'plans', (select jsonb_agg(to_jsonb(p) order by p.slug) from public.subscription_plans p),
  'subscription_timestamps', (select jsonb_agg(jsonb_build_object('id',s.id,'updated_at',s.updated_at) order by s.id)
    from public.subscriptions s),
  'member_count', (select count(*) from public.organisation_members),
  'affected_columns', (select jsonb_agg(to_jsonb(c)) from information_schema.columns c
    where table_schema='public' and ((table_name='subscriptions' and column_name='seat_quantity')
      or (table_name='organisation_members' and column_name in ('temporary_password_issued_at','onboarding_completed_at')))),
  'free_claims_existed', to_regclass('public.free_video_claims') is not null
) as recovery_snapshot;
