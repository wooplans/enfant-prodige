"use client";

import { useActionState, useMemo, useState } from "react";
import type { AdminSeries } from "@/lib/catalogue";
import { saveSeriesAction } from "@/app/admin/actions";
import { initialSeriesFormState, slugify } from "@/lib/series-schema";

type Props = {
  series?: AdminSeries | null;
};

export default function AdminSeriesForm({ series }: Props) {
  const [state, formAction, pending] = useActionState(saveSeriesAction, initialSeriesFormState);
  const [serie, setSerie] = useState(series?.serie ?? "");
  const [slug, setSlug] = useState(series?.slug ?? "");

  const pourQuiText = useMemo(() => series?.pourQui.join("\n") ?? "", [series]);
  const galleryText = useMemo(() => series?.galerie.join("\n") ?? "", [series]);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm" encType="multipart/form-data">
      <input type="hidden" name="databaseId" value={series?.databaseId ?? ""} />
      <input type="hidden" name="currentCover" value={series?.couverture ?? ""} />

      {state.message && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom de la série" error={state.errors?.serie?.[0]}>
          <input
            name="serie"
            value={serie}
            onChange={(event) => {
              setSerie(event.target.value);
              if (!series) setSlug(slugify(event.target.value));
            }}
            required
            className="admin-input"
          />
        </Field>
        <Field label="Slug URL" error={state.errors?.slug?.[0]}>
          <input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required className="admin-input" />
        </Field>
        <Field label="Titre" error={state.errors?.titre?.[0]}>
          <input name="titre" defaultValue={series?.titre ?? ""} required className="admin-input" />
        </Field>
        <Field label="Genre" error={state.errors?.genre?.[0]}>
          <input name="genre" defaultValue={series?.genre ?? ""} required className="admin-input" placeholder="Aventure · Science" />
        </Field>
      </div>

      <Field label="Description courte" error={state.errors?.description?.[0]}>
        <textarea name="description" defaultValue={series?.description ?? ""} required rows={4} className="admin-input" />
      </Field>

      <Field label="Description longue" error={state.errors?.descriptionLongue?.[0]}>
        <textarea name="descriptionLongue" defaultValue={series?.descriptionLongue ?? ""} required rows={7} className="admin-input" />
      </Field>

      <Field label="Pour qui ? Une ligne par point" error={state.errors?.pourQuiText?.[0]}>
        <textarea name="pourQuiText" defaultValue={pourQuiText} required rows={5} className="admin-input" />
      </Field>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Prix" error={state.errors?.prix?.[0]}>
          <input name="prix" type="number" min="0" defaultValue={series?.prix ?? 9900} required className="admin-input" />
        </Field>
        <Field label="Livraison" error={state.errors?.fraisLivraison?.[0]}>
          <input name="fraisLivraison" type="number" min="0" defaultValue={series?.fraisLivraison ?? 1000} required className="admin-input" />
        </Field>
        <Field label="Pages" error={state.errors?.nombrePages?.[0]}>
          <input name="nombrePages" type="number" min="1" defaultValue={series?.nombrePages ?? 32} required className="admin-input" />
        </Field>
        <Field label="Ordre" error={state.errors?.sortOrder?.[0]}>
          <input name="sortOrder" type="number" min="0" defaultValue={series?.sortOrder ?? 0} required className="admin-input" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Âge min" error={state.errors?.ageMin?.[0]}>
          <input name="ageMin" type="number" min="0" defaultValue={series?.ageMin ?? 6} required className="admin-input" />
        </Field>
        <Field label="Âge max" error={state.errors?.ageMax?.[0]}>
          <input name="ageMax" type="number" min="0" defaultValue={series?.ageMax ?? 10} required className="admin-input" />
        </Field>
        <Field label="Note" error={state.errors?.note?.[0]}>
          <input name="note" type="number" min="0" max="5" step="0.1" defaultValue={series?.note ?? 0} required className="admin-input" />
        </Field>
        <Field label="Nombre d'avis" error={state.errors?.nombreAvis?.[0]}>
          <input name="nombreAvis" type="number" min="0" defaultValue={series?.nombreAvis ?? 0} required className="admin-input" />
        </Field>
      </div>

      <Field label="Commandes cette semaine" error={state.errors?.nombreCommandesSemaine?.[0]}>
        <input name="nombreCommandesSemaine" type="number" min="0" defaultValue={series?.nombreCommandesSemaine ?? 0} required className="admin-input max-w-xs" />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Couverture" error={state.errors?.coverFile?.[0]}>
          {series?.couverture && <p className="mb-2 break-all text-xs text-gray-500">Actuelle : {series.couverture}</p>}
          <input name="coverFile" type="file" accept="image/*" className="admin-file" />
        </Field>
        <Field label="Nouvelles images galerie">
          <input name="galleryFiles" type="file" accept="image/*" multiple className="admin-file" />
        </Field>
      </div>

      <Field label="Galerie actuelle / URLs, une ligne par image" error={state.errors?.galleryText?.[0]}>
        <textarea name="galleryText" defaultValue={galleryText} rows={5} className="admin-input" />
      </Field>

      <div className="flex flex-wrap gap-4 rounded-2xl bg-amber-50 p-4">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input name="published" type="checkbox" defaultChecked={series?.published ?? false} className="h-4 w-4 accent-green-700" />
          Publiée sur le site
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input name="disponible" type="checkbox" defaultChecked={series?.disponible ?? true} className="h-4 w-4 accent-green-700" />
          Disponible à la commande
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
          <input name="landingPageMode" type="checkbox" defaultChecked={series?.landingPageMode ?? false} className="h-4 w-4 accent-green-700" />
          Mode landing page sans header ni footer
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button disabled={pending} className="rounded-2xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300">
          {pending ? "Enregistrement..." : series ? "Enregistrer les modifications" : "Créer la série"}
        </button>
        <a href="/admin" className="rounded-2xl border border-gray-200 px-6 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-50">
          Annuler
        </a>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-gray-800">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
