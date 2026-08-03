-- MindSettle media schema
-- Adds a `media` table plus a `user_media` sharing relationship.
-- Admin checks reuse the existing `user_roles` table (role = 'admin').
-- Run in the Supabase SQL editor (or via the CLI: supabase db execute -f media-schema.sql)
-- after database-schema.sql has already been applied.

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'video', 'audio')),
  file_size bigint check (file_size >= 0),
  uploaded_by uuid not null references profiles (id) on delete cascade,
  video_id uuid references videos (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Many-to-many: lets media be shared with/assigned to users other than the
-- uploader (e.g. an admin assigning media to a member), independent of
-- ownership via media.uploaded_by.
create table if not exists user_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  media_id uuid not null references media (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, media_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists media_uploaded_by_idx on media (uploaded_by);
create index if not exists media_video_id_idx on media (video_id);
create index if not exists user_media_user_id_idx on user_media (user_id);
create index if not exists user_media_media_id_idx on user_media (media_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table media enable row level security;
alter table user_media enable row level security;

-- media: users manage only their own uploads; admins can see everything.
create policy "Users can view their own media, admins view all"
  on media for select
  using (
    auth.uid() = uploaded_by
    or exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

create policy "Users can upload their own media"
  on media for insert
  with check (auth.uid() = uploaded_by);

create policy "Users can update their own media"
  on media for update
  using (auth.uid() = uploaded_by)
  with check (auth.uid() = uploaded_by);

create policy "Users can delete their own media"
  on media for delete
  using (auth.uid() = uploaded_by);

-- user_media: users can see media shared with them; admins can see all
-- shares. Rows are written server-side (service role), e.g. by an admin
-- assigning media to a member.
create policy "Users can view media shared with them, admins view all"
  on user_media for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

commit;
