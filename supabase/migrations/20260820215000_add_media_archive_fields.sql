alter table public.videos
  add column if not exists archive_provider text,
  add column if not exists archive_status text default 'not_archived',
  add column if not exists archive_path text,
  add column if not exists archive_error text,
  add column if not exists archived_at timestamptz;

alter table public.videos
  drop constraint if exists videos_archive_status_check;

alter table public.videos
  add constraint videos_archive_status_check
  check (
    archive_status in (
      'not_archived',
      'pending',
      'archived',
      'failed'
    )
  );
