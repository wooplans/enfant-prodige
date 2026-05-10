alter table public.series
  add column if not exists landing_page_mode boolean not null default false;

create index if not exists series_landing_page_mode_idx
  on public.series (landing_page_mode)
  where archived_at is null;
