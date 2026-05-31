create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  payment_ref text not null unique,
  monetbil_transaction_ref text unique,
  series_id uuid references public.series(id) on delete set null,
  series_slug text not null,
  series_title text not null,
  child_name text not null,
  child_gender text not null,
  delivery_quartier text not null,
  delivery_rue text,
  amount integer not null check (amount > 0),
  currency text not null default 'XAF',
  country text not null default 'CM',
  operator_code text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  payment_url text,
  return_url text,
  notify_url text,
  monetbil_request jsonb not null default '{}'::jsonb,
  monetbil_response jsonb not null default '{}'::jsonb,
  notification_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  failed_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_orders_status_idx
  on public.payment_orders (status, created_at desc);

create index if not exists payment_orders_series_slug_idx
  on public.payment_orders (series_slug, created_at desc);

create index if not exists payment_orders_payment_ref_idx
  on public.payment_orders (payment_ref);

alter table public.payment_orders enable row level security;
