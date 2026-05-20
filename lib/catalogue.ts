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
  email: string;
  telephone: string;
  quartier: string;
  rue: string;
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "237691001580";

export function buildWhatsAppMessage(bd: BD, commande: CommandeData): string {
  const adresse = commande.rue
    ? `${commande.quartier}, ${commande.rue}`
    : commande.quartier;

  const message = [
    `Bonjour ! Je souhaite commander une BD personnalisée :`,
    ``,
    `📚 *${bd.serie}*`,
    ``,
    `👶 Prénom de l'enfant : ${commande.prenom} ( ${commande.sexe} )`,
    ``,
    `📍 Quartier : ${adresse}`,
    ``,
    `💰 Montant à payer par Mobile Money : ${bd.prix.toLocaleString("fr-FR")} FCFA ✅`,
    `📦 Frais de livraison : ${bd.fraisLivraison.toLocaleString("fr-FR")} FCFA (payés à la réception)`,
    ``,
    `Merci de me confirmer les détails du paiement Mobile Money.`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
