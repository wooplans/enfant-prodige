import "server-only";

import type { AdminSeries, Avis, BD } from "@/lib/catalogue";
import { localCatalogue } from "@/lib/local-catalogue";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase/server";

type SeriesRow = {
  id: string;
  slug: string;
  serie: string;
  titre: string;
  genre: string;
  description: string;
  description_longue: string;
  pour_qui: string[] | null;
  prix: number;
  frais_livraison: number;
  couverture_url: string;
  galerie_urls: string[] | null;
  nombre_pages: number;
  age_min: number;
  age_max: number;
  disponible: boolean;
  landing_page_mode: boolean | null;
  published: boolean;
  archived_at: string | null;
  note: number | string | null;
  nombre_avis: number | null;
  nombre_commandes_semaine: number | null;
  avis: Avis[] | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

const BASE_SELECT_COLUMNS = [
  "id",
  "slug",
  "serie",
  "titre",
  "genre",
  "description",
  "description_longue",
  "pour_qui",
  "prix",
  "frais_livraison",
  "couverture_url",
  "galerie_urls",
  "nombre_pages",
  "age_min",
  "age_max",
  "disponible",
  "published",
  "archived_at",
  "note",
  "nombre_avis",
  "nombre_commandes_semaine",
  "avis",
  "sort_order",
  "created_at",
  "updated_at",
].join(",");

const SELECT_COLUMNS_WITH_LANDING = `${BASE_SELECT_COLUMNS},landing_page_mode`;

function isMissingLandingPageModeColumn(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "";
  return message.includes("landing_page_mode") && message.includes("does not exist");
}

function toPublicSeries(row: SeriesRow): BD {
  const galerie = row.galerie_urls?.length ? row.galerie_urls : [row.couverture_url].filter(Boolean);

  return {
    id: row.slug,
    slug: row.slug,
    serie: row.serie,
    titre: row.titre,
    genre: row.genre,
    description: row.description,
    descriptionLongue: row.description_longue,
    pourQui: row.pour_qui ?? [],
    prix: row.prix,
    fraisLivraison: row.frais_livraison,
    couverture: row.couverture_url,
    galerie,
    nombrePages: row.nombre_pages,
    ageMin: row.age_min,
    ageMax: row.age_max,
    disponible: row.disponible,
    landingPageMode: row.landing_page_mode ?? false,
    note: Number(row.note ?? 0),
    nombreAvis: row.nombre_avis ?? 0,
    nombreCommandesSemaine: row.nombre_commandes_semaine ?? 0,
    avis: row.avis ?? [],
  };
}

function toAdminSeries(row: SeriesRow): AdminSeries {
  return {
    ...toPublicSeries(row),
    databaseId: row.id,
    published: row.published,
    archivedAt: row.archived_at,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPublicCatalogue(): Promise<BD[]> {
  const supabase = getSupabasePublic();
  if (!supabase) return localCatalogue;

  const { data, error } = await supabase
    .from("series")
    .select(SELECT_COLUMNS_WITH_LANDING)
    .eq("published", true)
    .eq("disponible", true)
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingLandingPageModeColumn(error)) {
      const fallback = await supabase
        .from("series")
        .select(BASE_SELECT_COLUMNS)
        .eq("published", true)
        .eq("disponible", true)
        .is("archived_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!fallback.error) {
        return ((fallback.data ?? []) as unknown as SeriesRow[]).map(toPublicSeries);
      }
    }

    console.error("Unable to load public catalogue", error);
    return localCatalogue;
  }

  return ((data ?? []) as unknown as SeriesRow[]).map(toPublicSeries);
}

export async function getPublicSeriesBySlug(slug: string): Promise<BD | null> {
  const supabase = getSupabasePublic();
  const localSeries = localCatalogue.find((bd) => bd.slug === slug || bd.id === slug) ?? null;
  if (!supabase) return localSeries;

  const { data, error } = await supabase
    .from("series")
    .select(SELECT_COLUMNS_WITH_LANDING)
    .eq("slug", slug)
    .eq("published", true)
    .eq("disponible", true)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    if (isMissingLandingPageModeColumn(error)) {
      const fallback = await supabase
        .from("series")
        .select(BASE_SELECT_COLUMNS)
        .eq("slug", slug)
        .eq("published", true)
        .eq("disponible", true)
        .is("archived_at", null)
        .maybeSingle();

      if (!fallback.error) {
        return fallback.data ? toPublicSeries(fallback.data as unknown as SeriesRow) : localSeries;
      }
    }

    console.error("Unable to load public series", error);
    return localSeries;
  }

  return data ? toPublicSeries(data as unknown as SeriesRow) : localSeries;
}

export async function getAdminSeries(): Promise<AdminSeries[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .select(SELECT_COLUMNS_WITH_LANDING)
    .order("archived_at", { ascending: true, nullsFirst: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Impossible de charger les séries: ${error.message}`);

  return ((data ?? []) as unknown as SeriesRow[]).map(toAdminSeries);
}

export async function getAdminSeriesById(id: string): Promise<AdminSeries | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .select(SELECT_COLUMNS_WITH_LANDING)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingLandingPageModeColumn(error)) {
      const fallback = await supabase
        .from("series")
        .select(BASE_SELECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (!fallback.error) {
        return fallback.data ? toAdminSeries(fallback.data as unknown as SeriesRow) : null;
      }
    }

    throw new Error(`Impossible de charger la série: ${error.message}`);
  }

  return data ? toAdminSeries(data as unknown as SeriesRow) : null;
}
