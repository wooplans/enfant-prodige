create table if not exists public.payment_settings (
  id text primary key default 'global',
  default_provider text not null default 'chariow' check (default_provider in ('chariow', 'monetbil')),
  monetbil_enabled boolean not null default false,
  chariow_product_code text not null default 'prd_k4bjo5',
  chariow_product_url text not null default 'https://enfantprodige.mychariow.shop/prd_k4bjo5',
  chariow_snap_snippet text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.payment_settings (id)
values ('global')
on conflict (id) do nothing;
