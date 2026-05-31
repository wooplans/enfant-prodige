create table if not exists public.analytics_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  visitor_id text,
  first_path text not null,
  first_referrer text,
  first_source text,
  utm jsonb not null default '{}'::jsonb,
  device_type text not null default 'unknown' check (device_type in ('desktop', 'mobile', 'tablet', 'bot', 'unknown')),
  browser_name text not null default 'unknown',
  country_code text,
  started_at timestamptz not null,
  last_seen_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.analytics_sessions(session_id) on delete cascade,
  event_type text not null check (
    event_type in (
      'session_start',
      'page_view',
      'cta_click',
      'checkout_open',
      'checkout_close',
      'checkout_details_submit',
      'scroll_depth',
      'time_on_page',
      'carousel_interaction'
    )
  ),
  path text not null,
  title text,
  referrer text,
  utm jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_last_seen_at_idx
  on public.analytics_sessions (last_seen_at desc);

create index if not exists analytics_sessions_visitor_id_idx
  on public.analytics_sessions (visitor_id)
  where visitor_id is not null;

create index if not exists analytics_events_occurred_at_idx
  on public.analytics_events (occurred_at desc);

create index if not exists analytics_events_type_occurred_at_idx
  on public.analytics_events (event_type, occurred_at desc);

create index if not exists analytics_events_path_occurred_at_idx
  on public.analytics_events (path, occurred_at desc);

create index if not exists analytics_events_session_occurred_at_idx
  on public.analytics_events (session_id, occurred_at asc);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

revoke all on table public.analytics_sessions from anon, authenticated;
revoke all on table public.analytics_events from anon, authenticated;
grant select, insert, update, delete on table public.analytics_sessions to service_role;
grant select, insert, update, delete on table public.analytics_events to service_role;
