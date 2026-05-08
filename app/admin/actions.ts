"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminAction, clearAdminSession, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";
import { linesToList, seriesFormSchema, type SeriesFormState } from "@/lib/series-schema";
import { getSupabaseAdmin, SERIES_BUCKET } from "@/lib/supabase/server";

const loginSchema = z.object({
  password: z.string().min(1, "Mot de passe obligatoire."),
});

export type LoginState = {
  ok: boolean;
  message: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, message: "Mot de passe obligatoire." };
  }

  try {
    if (!verifyAdminPassword(parsed.data.password)) {
      return { ok: false, message: "Mot de passe incorrect." };
    }

    await createAdminSession();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Connexion impossible.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

function fileFromForm(value: FormDataEntryValue | null): File | null {
  if (!value || typeof value === "string" || value.size === 0) return null;
  return value;
}

function safeFileName(name: string) {
  const parts = name.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()}` : "";
  const base = parts
    .join(".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "image"}${extension.toLowerCase()}`;
}

async function uploadSeriesImage(file: File, slug: string) {
  const supabase = getSupabaseAdmin();
  const path = `${slug}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage.from(SERIES_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new Error(`Upload image impossible: ${error.message}`);

  const { data } = supabase.storage.from(SERIES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function saveSeriesAction(
  _state: SeriesFormState,
  formData: FormData
): Promise<SeriesFormState> {
  await assertAdminAction();

  const raw = {
    databaseId: formData.get("databaseId") ?? "",
    slug: formData.get("slug") ?? "",
    serie: formData.get("serie") ?? "",
    titre: formData.get("titre") ?? "",
    genre: formData.get("genre") ?? "",
    description: formData.get("description") ?? "",
    descriptionLongue: formData.get("descriptionLongue") ?? "",
    pourQuiText: formData.get("pourQuiText") ?? "",
    prix: formData.get("prix") ?? "",
    fraisLivraison: formData.get("fraisLivraison") ?? "",
    nombrePages: formData.get("nombrePages") ?? "",
    ageMin: formData.get("ageMin") ?? "",
    ageMax: formData.get("ageMax") ?? "",
    note: formData.get("note") ?? "0",
    nombreAvis: formData.get("nombreAvis") ?? "0",
    nombreCommandesSemaine: formData.get("nombreCommandesSemaine") ?? "0",
    sortOrder: formData.get("sortOrder") ?? "0",
    published: formData.get("published") === "on",
    disponible: formData.get("disponible") === "on",
    currentCover: formData.get("currentCover") ?? "",
    galleryText: formData.get("galleryText") ?? "",
  };

  const parsed = seriesFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Corrigez les champs en erreur.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = parsed.data;
  const coverFile = fileFromForm(formData.get("coverFile"));
  const galleryFiles = formData.getAll("galleryFiles").map(fileFromForm).filter(Boolean) as File[];

  try {
    const couvertureUrl = coverFile
      ? await uploadSeriesImage(coverFile, values.slug)
      : values.currentCover?.trim() || "";

    if (!couvertureUrl) {
      return {
        ok: false,
        message: "Ajoutez une image de couverture.",
        errors: { coverFile: ["La couverture est obligatoire."] },
      };
    }

    const uploadedGallery = await Promise.all(
      galleryFiles.map((file) => uploadSeriesImage(file, values.slug))
    );
    const galleryUrls = Array.from(
      new Set([...linesToList(values.galleryText ?? ""), ...uploadedGallery].filter(Boolean))
    );
    const finalGallery = galleryUrls.length > 0 ? galleryUrls : [couvertureUrl];

    const payload = {
      slug: values.slug,
      serie: values.serie,
      titre: values.titre,
      genre: values.genre,
      description: values.description,
      description_longue: values.descriptionLongue,
      pour_qui: linesToList(values.pourQuiText),
      prix: values.prix,
      frais_livraison: values.fraisLivraison,
      couverture_url: couvertureUrl,
      galerie_urls: finalGallery,
      nombre_pages: values.nombrePages,
      age_min: values.ageMin,
      age_max: values.ageMax,
      disponible: values.disponible,
      published: values.published,
      note: values.note,
      nombre_avis: values.nombreAvis,
      nombre_commandes_semaine: values.nombreCommandesSemaine,
      sort_order: values.sortOrder,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseAdmin();
    const id = values.databaseId || undefined;
    const result = id
      ? await supabase.from("series").update(payload).eq("id", id).select("id").single()
      : await supabase.from("series").insert(payload).select("id").single();

    if (result.error) throw new Error(result.error.message);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Enregistrement impossible.",
    };
  }

  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath(`/bd/${values.slug}`);
  redirect("/admin");
}

export async function archiveSeriesAction(formData: FormData) {
  await assertAdminAction();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing series id.");

  const { error } = await getSupabaseAdmin()
    .from("series")
    .update({ archived_at: new Date().toISOString(), published: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/catalogue");
  redirect("/admin");
}

export async function restoreSeriesAction(formData: FormData) {
  await assertAdminAction();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing series id.");

  const { error } = await getSupabaseAdmin()
    .from("series")
    .update({ archived_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  redirect("/admin");
}

export async function togglePublishSeriesAction(formData: FormData) {
  await assertAdminAction();
  const id = String(formData.get("id") ?? "");
  const published = String(formData.get("published") ?? "") === "true";
  if (!id) throw new Error("Missing series id.");

  const { error } = await getSupabaseAdmin()
    .from("series")
    .update({ published: !published, updated_at: new Date().toISOString() })
    .eq("id", id)
    .is("archived_at", null);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/catalogue");
  redirect("/admin");
}
