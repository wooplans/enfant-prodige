create extension if not exists pgcrypto;

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  serie text not null,
  titre text not null,
  genre text not null,
  description text not null,
  description_longue text not null,
  pour_qui text[] not null default '{}',
  prix integer not null check (prix > 0),
  frais_livraison integer not null default 0 check (frais_livraison >= 0),
  couverture_url text not null,
  galerie_urls text[] not null default '{}',
  nombre_pages integer not null check (nombre_pages > 0),
  age_min integer not null default 0 check (age_min >= 0),
  age_max integer not null default 0 check (age_max >= age_min),
  disponible boolean not null default true,
  published boolean not null default false,
  archived_at timestamptz,
  note numeric(2, 1) not null default 0 check (note >= 0 and note <= 5),
  nombre_avis integer not null default 0 check (nombre_avis >= 0),
  nombre_commandes_semaine integer not null default 0 check (nombre_commandes_semaine >= 0),
  avis jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists series_public_idx
  on public.series (published, disponible, sort_order, created_at desc)
  where archived_at is null;

create index if not exists series_slug_public_idx
  on public.series (slug)
  where archived_at is null and published = true and disponible = true;

alter table public.series enable row level security;

drop policy if exists "Public can read published series" on public.series;
create policy "Public can read published series"
  on public.series
  for select
  using (published = true and disponible = true and archived_at is null);

insert into storage.buckets (id, name, public)
values ('series-images', 'series-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read series images" on storage.objects;
create policy "Public can read series images"
  on storage.objects
  for select
  using (bucket_id = 'series-images');
