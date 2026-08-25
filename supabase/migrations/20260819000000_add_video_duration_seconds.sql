alter table public.videos
add column if not exists duration_seconds integer;

update public.videos
set duration_seconds = duration_minutes * 60
where duration_seconds is null
  and duration_minutes is not null;

alter table public.videos
add constraint videos_duration_seconds_nonnegative
check (
  duration_seconds is null
  or duration_seconds >= 0
);
