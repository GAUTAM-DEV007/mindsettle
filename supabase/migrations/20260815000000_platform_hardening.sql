-- Reproducible application schema and least-privilege policies for Mindsettle.
-- Safe to apply to an existing project: tables, columns, triggers and policies
-- are created or replaced idempotently.

begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text,
  category_id uuid references public.categories (id) on delete set null,
  duration_minutes integer check (duration_minutes > 0),
  thumbnail_url text,
  video_url text,
  is_premium boolean not null default true,
  is_featured boolean not null default false,
  show_on_homepage boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.videos add column if not exists is_featured boolean not null default false;
alter table public.videos add column if not exists show_on_homepage boolean not null default false;
alter table public.videos add column if not exists is_published boolean not null default false;

create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  emoji text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.video_moods (
  video_id uuid not null references public.videos (id) on delete cascade,
  mood_id uuid not null references public.moods (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, mood_id)
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_videos (
  program_id uuid not null references public.programs (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  primary key (program_id, video_id),
  unique (program_id, position)
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text,
  is_enabled boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  progress_seconds integer not null default 0 check (progress_seconds >= 0),
  completed boolean not null default false,
  watched_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  plan text,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_category_id_idx on public.videos (category_id);
create index if not exists videos_published_created_idx on public.videos (is_published, created_at desc);
create index if not exists favourites_user_id_idx on public.favourites (user_id);
create index if not exists favourites_video_id_idx on public.favourites (video_id);
create index if not exists watch_history_user_id_idx on public.watch_history (user_id);
create index if not exists watch_history_video_id_idx on public.watch_history (video_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists organisation_members_organisation_id_idx on public.organisation_members (organisation_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_programs_updated_at on public.programs;
create trigger set_programs_updated_at before update on public.programs for each row execute function public.set_updated_at();
drop trigger if exists set_social_links_updated_at on public.social_links;
create trigger set_social_links_updated_at before update on public.social_links for each row execute function public.set_updated_at();
drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Link an invitation immediately when the email already belongs to a user.
create or replace function public.link_existing_organisation_member()
returns trigger language plpgsql security definer set search_path = public, auth as $$
declare existing_user_id uuid;
begin
  select id into existing_user_id from auth.users where lower(email) = lower(new.email) limit 1;
  if existing_user_id is not null then
    new.user_id := existing_user_id;
    new.status := 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists link_existing_organisation_member on public.organisation_members;
create trigger link_existing_organisation_member before insert or update of email on public.organisation_members for each row execute function public.link_existing_organisation_member();

update public.organisation_members m
set user_id = u.id, status = 'active'
from auth.users u
where m.user_id is null and lower(m.email) = lower(u.email);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.videos enable row level security;
alter table public.moods enable row level security;
alter table public.video_moods enable row level security;
alter table public.programs enable row level security;
alter table public.program_videos enable row level security;
alter table public.social_links enable row level security;
alter table public.favourites enable row level security;
alter table public.watch_history enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Organisations manage their own members" on public.organisation_members;
drop policy if exists "Organisations view their own members" on public.organisation_members;
create policy "Organisations view their own members" on public.organisation_members for select to authenticated using (auth.uid() = organisation_id);
drop policy if exists "Organisations add their own members" on public.organisation_members;
create policy "Organisations add their own members" on public.organisation_members for insert to authenticated with check (auth.uid() = organisation_id);
drop policy if exists "Organisations remove their own members" on public.organisation_members;
create policy "Organisations remove their own members" on public.organisation_members for delete to authenticated using (auth.uid() = organisation_id);

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Categories are viewable by everyone" on public.categories;
create policy "Categories are viewable by signed in users" on public.categories for select to authenticated using (true);
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Videos are viewable by authenticated users" on public.videos;
drop policy if exists "Published videos and admin catalogue" on public.videos;
create policy "Published videos and admin catalogue" on public.videos for select to authenticated using (is_published or exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Admins manage videos" on public.videos;
create policy "Admins manage videos" on public.videos for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Moods are viewable by signed in users" on public.moods;
create policy "Moods are viewable by signed in users" on public.moods for select to authenticated using (true);
drop policy if exists "Admins manage moods" on public.moods;
create policy "Admins manage moods" on public.moods for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Published video moods are viewable" on public.video_moods;
create policy "Published video moods are viewable" on public.video_moods for select to authenticated using (exists (select 1 from public.videos v where v.id = video_id and v.is_published) or exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Admins manage video moods" on public.video_moods;
create policy "Admins manage video moods" on public.video_moods for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Published programs and admin catalogue" on public.programs;
create policy "Published programs and admin catalogue" on public.programs for select to authenticated using (is_published or exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Admins manage programs" on public.programs;
create policy "Admins manage programs" on public.programs for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Published program videos and admin catalogue" on public.program_videos;
create policy "Published program videos and admin catalogue" on public.program_videos for select to authenticated using (
  (
    exists (select 1 from public.programs p where p.id = program_videos.program_id and p.is_published)
    and exists (select 1 from public.videos v where v.id = program_videos.video_id and v.is_published)
  )
  or exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')
);
drop policy if exists "Admins manage program videos" on public.program_videos;
create policy "Admins manage program videos" on public.program_videos for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Enabled social links are public" on public.social_links;
create policy "Enabled social links are public" on public.social_links for select to anon, authenticated using (is_enabled or exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Admins manage social links" on public.social_links;
create policy "Admins manage social links" on public.social_links for all to authenticated using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

drop policy if exists "Users can view their own favourites" on public.favourites;
drop policy if exists "Users can add their own favourites" on public.favourites;
drop policy if exists "Users can remove their own favourites" on public.favourites;
drop policy if exists "Users manage their own favourites" on public.favourites;
create policy "Users manage their own favourites" on public.favourites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.videos v where v.id = video_id and v.is_published));
drop policy if exists "Users can view their own watch history" on public.watch_history;
drop policy if exists "Users can insert their own watch history" on public.watch_history;
drop policy if exists "Users can update their own watch history" on public.watch_history;
drop policy if exists "Users can delete their own watch history" on public.watch_history;
drop policy if exists "Users manage their own watch history" on public.watch_history;
create policy "Users manage their own watch history" on public.watch_history for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.videos v where v.id = video_id and v.is_published));
drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);

-- Admin analytics are exposed only through this role-checked RPC. Keeping
-- the aggregation in Postgres avoids granting administrators broad profile,
-- subscription or watch-history reads through the client API.
create or replace function public.admin_dashboard_analytics(top_n_limit integer default 10)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'admin'
  ) then
    raise exception 'Admin access required';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'total_videos', (select count(*) from public.videos),
    'subscriptions_by_status', jsonb_build_object(
      'active', (select count(*) from public.subscriptions where status = 'active'),
      'trialing', (select count(*) from public.subscriptions where status = 'trialing'),
      'canceled', (select count(*) from public.subscriptions where status = 'canceled')
    ),
    'most_watched_videos', (
      select coalesce(jsonb_agg(ranked), '[]'::jsonb)
      from (
        select v.id as video_id, v.title, count(h.id) as watch_count
        from public.watch_history h
        join public.videos v on v.id = h.video_id
        group by v.id, v.title
        order by count(h.id) desc, v.title asc
        limit greatest(top_n_limit, 0)
      ) ranked
    ),
    'most_favourited_videos', (
      select coalesce(jsonb_agg(ranked), '[]'::jsonb)
      from (
        select v.id as video_id, v.title, count(f.id) as favourite_count
        from public.favourites f
        join public.videos v on v.id = f.video_id
        group by v.id, v.title
        order by count(f.id) desc, v.title asc
        limit greatest(top_n_limit, 0)
      ) ranked
    ),
    'user_growth', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object('date', d::date, 'new_users', coalesce(counts.new_users, 0))
          order by d
        ),
        '[]'::jsonb
      )
      from generate_series(current_date - interval '29 days', current_date, interval '1 day') d
      left join (
        select created_at::date signup_date, count(*) new_users
        from public.profiles
        group by created_at::date
      ) counts on counts.signup_date = d::date
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_analytics(integer) from public;
revoke all on function public.admin_dashboard_analytics(integer) from anon;
grant execute on function public.admin_dashboard_analytics(integer) to authenticated;

-- Private media bucket: admins manage files; signed-in viewers can read only
-- files referenced by a published video.
insert into storage.buckets (id, name, public, file_size_limit)
values ('videos', 'videos', false, 5368709120)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Mindsettle published media read" on storage.objects;
create policy "Mindsettle published media read" on storage.objects for select to authenticated using (
  bucket_id = 'videos' and (
    exists (select 1 from public.videos v where v.is_published and (v.video_url = name or v.thumbnail_url = name))
    or exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')
  )
);
drop policy if exists "Mindsettle admin media insert" on storage.objects;
create policy "Mindsettle admin media insert" on storage.objects for insert to authenticated with check (bucket_id = 'videos' and exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Mindsettle admin media update" on storage.objects;
create policy "Mindsettle admin media update" on storage.objects for update to authenticated using (bucket_id = 'videos' and exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin')) with check (bucket_id = 'videos' and exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));
drop policy if exists "Mindsettle admin media delete" on storage.objects;
create policy "Mindsettle admin media delete" on storage.objects for delete to authenticated using (bucket_id = 'videos' and exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

commit;
