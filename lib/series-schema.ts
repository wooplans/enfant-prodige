import { z } from "zod";

export const seriesFormSchema = z.object({
  databaseId: z.string().uuid().optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(2, "Le slug doit contenir au moins 2 caractères.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Utilisez uniquement minuscules, chiffres et tirets."),
  serie: z.string().trim().min(2, "Le nom de série est obligatoire."),
  titre: z.string().trim().min(2, "Le titre est obligatoire."),
  genre: z.string().trim().min(2, "Le genre est obligatoire."),
  description: z.string().trim().min(20, "La description courte doit être plus détaillée."),
  descriptionLongue: z.string().trim().min(40, "La description longue doit être plus détaillée."),
  pourQuiText: z.string().trim().min(5, "Ajoutez au moins une raison dans \"Pour qui\"."),
  prix: z.coerce.number().int().positive("Le prix doit être positif."),
  fraisLivraison: z.coerce.number().int().min(0, "Les frais de livraison ne peuvent pas être négatifs."),
  nombrePages: z.coerce.number().int().positive("Le nombre de pages doit être positif."),
  ageMin: z.coerce.number().int().min(0, "L'âge minimum est invalide."),
  ageMax: z.coerce.number().int().min(0, "L'âge maximum est invalide."),
  note: z.coerce.number().min(0).max(5),
  nombreAvis: z.coerce.number().int().min(0),
  nombreCommandesSemaine: z.coerce.number().int().min(0),
  sortOrder: z.coerce.number().int().min(0),
  published: z.coerce.boolean().default(false),
  disponible: z.coerce.boolean().default(true),
  currentCover: z.string().trim().optional(),
  galleryText: z.string().trim().optional(),
});

export type SeriesFormValues = z.infer<typeof seriesFormSchema>;

export type SeriesFormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export const initialSeriesFormState: SeriesFormState = {
  ok: false,
  message: "",
};

export function linesToList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
