alter table public.payment_orders
  add column if not exists provider text not null default 'chariow' check (provider in ('chariow', 'monetbil'));

alter table public.payment_orders
  add column if not exists provider_order_ref text;

alter table public.payment_orders
  add column if not exists provider_product_code text;

alter table public.payment_orders
  add column if not exists provider_payload jsonb not null default '{}'::jsonb;

alter table public.payment_orders
  add column if not exists checkout_url text;

create index if not exists payment_orders_provider_idx
  on public.payment_orders (provider, created_at desc);

create index if not exists payment_orders_provider_order_ref_idx
  on public.payment_orders (provider_order_ref);
