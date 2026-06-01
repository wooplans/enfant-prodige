export interface Avis {
  nom: string;
  note: number;
  commentaire: string;
  ville: string;
  date: string;
  avatar: string;
}

export interface BD {
  id: string;
  slug: string;
  titre: string;
  description: string;
  descriptionLongue: string;
  pourQui: string[];
  prix: number;
  fraisLivraison: number;
  couverture: string;
  genre: string;
  serie: string;
  nombrePages: number;
  ageMin: number;
  ageMax: number;
  disponible: boolean;
  landingPageMode: boolean;
  note: number;
  nombreAvis: number;
  nombreCommandesSemaine: number;
  galerie: string[];
  avis: Avis[];
}

export interface AdminSeries extends BD {
  databaseId: string;
  published: boolean;
  archivedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommandeData {
  prenom: string;
  sexe: "Garçon" | "Fille" | null;
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "237691001580";

export function buildWhatsAppMessage(bd: BD, commande: CommandeData): string {
  const message = [
    `Bonjour ! Je souhaite commander la BD personnalisée :`,
    ``,
    `📚 *${bd.serie}*`,
    `👶 Prénom : ${commande.prenom} (${commande.sexe})`,
    ``,
    `💰 Paiement Mobile Money : ${bd.prix.toLocaleString("fr-FR")} FCFA`,
    `📦 Livraison : ${bd.fraisLivraison.toLocaleString("fr-FR")} FCFA (à la réception)`,
    ``,
    `Merci de me confirmer le numéro Mobile Money et de me demander mon adresse de livraison 🙏`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
