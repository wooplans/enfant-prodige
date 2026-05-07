export interface BD {
  id: string;
  titre: string;
  auteur: string;
  description: string;
  prix: number;
  fraisLivraison: number;
  couverture: string;
  genre: string;
  tome?: number;
  disponible: boolean;
  nouveaute?: boolean;
}

export const WHATSAPP_NUMBER = "237600000000"; // À remplacer par votre numéro

export const catalogue: BD[] = [
  {
    id: "bd-001",
    titre: "Anansi le Sage",
    auteur: "Kofi Mensah",
    description:
      "L'araignée légendaire Anansi traverse les villages d'Afrique centrale pour répandre la sagesse et déjouer les pièges des puissants. Une série captivante pour toute la famille.",
    prix: 2500,
    fraisLivraison: 500,
    couverture: "/covers/anansi.jpg",
    genre: "Aventure / Conte africain",
    tome: 1,
    disponible: true,
    nouveaute: true,
  },
  {
    id: "bd-002",
    titre: "Anansi le Sage",
    auteur: "Kofi Mensah",
    description:
      "Anansi affronte le Roi Léopard dans une épreuve d'intelligence qui déterminera le destin de tout un peuple. Suite palpitante du tome 1.",
    prix: 2500,
    fraisLivraison: 500,
    couverture: "/covers/anansi2.jpg",
    genre: "Aventure / Conte africain",
    tome: 2,
    disponible: true,
  },
  {
    id: "bd-003",
    titre: "Les Guerrières de Foumban",
    auteur: "Awa Nkemdirim",
    description:
      "Inspiré des reines guerrières du Royaume Bamoun, ce récit épique suit trois sœurs qui défendent leur peuple contre l'envahisseur au XIXe siècle.",
    prix: 3000,
    fraisLivraison: 500,
    couverture: "/covers/guerrieres.jpg",
    genre: "Historique / Action",
    disponible: true,
    nouveaute: true,
  },
  {
    id: "bd-004",
    titre: "Douala by Night",
    auteur: "Patrice Bello",
    description:
      "Un détective privé sillonne Douala à la recherche d'une jeune disparue. Polar urbain immergé dans l'ambiance nocturne de la métropole camerounaise.",
    prix: 2800,
    fraisLivraison: 500,
    couverture: "/covers/douala.jpg",
    genre: "Policier / Noir",
    tome: 1,
    disponible: true,
  },
  {
    id: "bd-005",
    titre: "Ndzana et le Monde Invisible",
    auteur: "Marie-Claire Essono",
    description:
      "Ndzana, jeune garçon beti, découvre qu'il peut voir les esprits. Une aventure fantastique entre tradition et modernité dans le Cameroun rural.",
    prix: 2000,
    fraisLivraison: 500,
    couverture: "/covers/ndzana.jpg",
    genre: "Fantastique / Jeunesse",
    disponible: true,
  },
  {
    id: "bd-006",
    titre: "Champion de Yaoundé",
    auteur: "Roger Ateba",
    description:
      "Le destin de Mbida, gamin des rues de Yaoundé qui rêve de devenir footballeur professionnel malgré tous les obstacles. Une ode à la persévérance.",
    prix: 2000,
    fraisLivraison: 500,
    couverture: "/covers/champion.jpg",
    genre: "Sport / Drame",
    disponible: false,
  },
];

export function buildWhatsAppMessage(bd: BD, quantite = 1): string {
  const total = bd.prix * quantite;
  const message = [
    `Bonjour ! Je souhaite commander la BD suivante :`,
    ``,
    `📚 *${bd.titre}*${bd.tome ? ` - Tome ${bd.tome}` : ""}`,
    `✍️ Auteur : ${bd.auteur}`,
    `💰 Prix : ${bd.prix.toLocaleString("fr-FR")} FCFA`,
    `📦 Frais de livraison : ${bd.fraisLivraison.toLocaleString("fr-FR")} FCFA (payés à la livraison)`,
    `🛒 Quantité : ${quantite}`,
    `💵 Total commande : ${total.toLocaleString("fr-FR")} FCFA`,
    ``,
    `Merci de me confirmer la disponibilité et le délai de livraison.`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
