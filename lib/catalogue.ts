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
  titre: string;
  auteur: string;
  description: string;
  descriptionLongue: string;
  pourQui: string[];
  prix: number;
  fraisLivraison: number;
  couverture: string;
  genre: string;
  tome?: number;
  disponible: boolean;
  nouveaute?: boolean;
  note: number;
  nombreAvis: number;
  nombreCommandesSemaine: number;
  avis: Avis[];
}

export const WHATSAPP_NUMBER = "237600000000"; // À remplacer par votre numéro

export const catalogue: BD[] = [
  {
    id: "bd-001",
    titre: "Anansi le Sage",
    auteur: "Kofi Mensah",
    description:
      "L'araignée légendaire Anansi traverse les villages d'Afrique centrale pour répandre la sagesse et déjouer les pièges des puissants.",
    descriptionLongue:
      "Plongez dans l'univers envoûtant d'Anansi, l'araignée la plus rusée d'Afrique. Dans ce premier tome, Anansi affronte le Grand Chef du village qui opprime les paysans. Avec humour, intelligence et sagesse ancestrale, il va retourner chaque situation à son avantage. Des illustrations vibrantes inspirées des arts traditionnels camerounais, pour petits et grands.",
    pourQui: [
      "Vous aimez les contes et légendes africaines",
      "Vous cherchez un cadeau original pour un enfant ou un adulte",
      "Vous voulez soutenir la création artistique camerounaise",
      "Vous aimez les histoires avec des valeurs de justice et de sagesse",
    ],
    prix: 2500,
    fraisLivraison: 500,
    couverture: "/covers/anansi.jpg",
    genre: "Aventure / Conte africain",
    tome: 1,
    disponible: true,
    nouveaute: true,
    note: 4.9,
    nombreAvis: 38,
    nombreCommandesSemaine: 14,
    avis: [
      {
        nom: "Clarisse M.",
        note: 5,
        commentaire:
          "Mes enfants n'arrêtent pas de la relire ! Les illustrations sont magnifiques et l'histoire est captivante. Parfait cadeau d'anniversaire.",
        ville: "Yaoundé",
        date: "il y a 3 jours",
        avatar: "C",
      },
      {
        nom: "Jean-Pierre N.",
        note: 5,
        commentaire:
          "Enfin une BD qui raconte notre culture ! La livraison était rapide, j'ai reçu le colis en 2 jours à Douala.",
        ville: "Douala",
        date: "il y a 1 semaine",
        avatar: "J",
      },
      {
        nom: "Fatou B.",
        note: 4,
        commentaire:
          "Très belle BD, les dessins sont de qualité. Je recommande vraiment pour les amateurs de culture africaine.",
        ville: "Bafoussam",
        date: "il y a 2 semaines",
        avatar: "F",
      },
    ],
  },
  {
    id: "bd-002",
    titre: "Anansi le Sage",
    auteur: "Kofi Mensah",
    description:
      "Anansi affronte le Roi Léopard dans une épreuve d'intelligence qui déterminera le destin de tout un peuple.",
    descriptionLongue:
      "Dans ce deuxième tome haletant, Anansi est défié par le puissant Roi Léopard en personne. Une série d'épreuves épiques attend notre héros. Chaque défi cache une leçon de vie profonde. Les fans du premier tome seront comblés par cette suite encore plus riche en rebondissements et en sagesse.",
    pourQui: [
      "Vous avez adoré le tome 1 et voulez la suite",
      "Vous aimez les récits de dépassement et d'intelligence",
      "Vous cherchez une BD pour toute la famille",
      "Vous voulez compléter votre collection Anansi",
    ],
    prix: 2500,
    fraisLivraison: 500,
    couverture: "/covers/anansi2.jpg",
    genre: "Aventure / Conte africain",
    tome: 2,
    disponible: true,
    note: 4.8,
    nombreAvis: 21,
    nombreCommandesSemaine: 9,
    avis: [
      {
        nom: "Armand T.",
        note: 5,
        commentaire:
          "Encore mieux que le tome 1 ! L'histoire est plus intense et les illustrations encore plus belles. Je l'ai lu d'une traite.",
        ville: "Douala",
        date: "il y a 5 jours",
        avatar: "A",
      },
      {
        nom: "Nadia K.",
        note: 4,
        commentaire:
          "Très bon tome, on retrouve Anansi avec plaisir. La fin est surprenante, j'attends le tome 3 !",
        ville: "Yaoundé",
        date: "il y a 2 semaines",
        avatar: "N",
      },
      {
        nom: "Patrick E.",
        note: 5,
        commentaire: "Commandé pour mon fils de 10 ans, il est accro ! Livraison impeccable.",
        ville: "Ngaoundéré",
        date: "il y a 3 semaines",
        avatar: "P",
      },
    ],
  },
  {
    id: "bd-003",
    titre: "Les Guerrières de Foumban",
    auteur: "Awa Nkemdirim",
    description:
      "Inspiré des reines guerrières du Royaume Bamoun, ce récit épique suit trois sœurs qui défendent leur peuple contre l'envahisseur.",
    descriptionLongue:
      "Au XIXe siècle, dans le puissant Royaume Bamoun, trois sœurs héritières d'un lignage guerrier se retrouvent face à l'invasion. Yaa, l'aînée stratège, Amina la combattante, et Ndoumbe la guérisseuse, vont unir leurs forces pour protéger leur peuple. Un récit épique ancré dans l'histoire réelle du Cameroun, avec des planches d'une beauté spectaculaire.",
    pourQui: [
      "Vous aimez les récits historiques et épiques africains",
      "Vous cherchez une BD avec des héroïnes fortes et inspirantes",
      "Vous êtes passionné(e) par l'histoire du Cameroun",
      "Vous voulez un cadeau marquant pour un(e) ami(e)",
    ],
    prix: 3000,
    fraisLivraison: 500,
    couverture: "/covers/guerrieres.jpg",
    genre: "Historique / Action",
    disponible: true,
    nouveaute: true,
    note: 5.0,
    nombreAvis: 17,
    nombreCommandesSemaine: 11,
    avis: [
      {
        nom: "Sophie A.",
        note: 5,
        commentaire:
          "Une BD qui me représente enfin ! Les héroïnes sont puissantes, l'histoire est vraie. J'ai pleuré à la fin. Un chef-d'œuvre.",
        ville: "Yaoundé",
        date: "il y a 2 jours",
        avatar: "S",
      },
      {
        nom: "Rodrigue F.",
        note: 5,
        commentaire:
          "Cadeau pour ma femme, elle a adoré. Les illustrations sont d'une qualité exceptionnelle. Bravo à l'auteure.",
        ville: "Douala",
        date: "il y a 1 semaine",
        avatar: "R",
      },
      {
        nom: "Ines M.",
        note: 5,
        commentaire:
          "Enfin une histoire qui parle de nos reines ! Livraison rapide, très bien emballé. Je rachète pour ma sœur.",
        ville: "Foumban",
        date: "il y a 10 jours",
        avatar: "I",
      },
    ],
  },
  {
    id: "bd-004",
    titre: "Douala by Night",
    auteur: "Patrice Bello",
    description:
      "Un détective privé sillonne Douala à la recherche d'une jeune disparue. Polar urbain immergé dans l'ambiance nocturne de la métropole.",
    descriptionLongue:
      "Marcus Ebongue, détective désabusé de Douala, reçoit une mission étrange : retrouver une étudiante disparue dans le quartier de Bonanjo. Mais plus il avance dans l'enquête, plus les pistes le mènent vers les cercles du pouvoir. Un polar haletant aux ambiances nocturnes saisissantes, avec un Douala jamais vu dans la BD africaine.",
    pourQui: [
      "Vous êtes fan de polars et de romans noirs",
      "Vous aimez les histoires urbaines ancrées dans le Cameroun réel",
      "Vous cherchez une BD pour adultes avec du suspense",
      "Vous voulez découvrir Douala sous un angle inédit",
    ],
    prix: 2800,
    fraisLivraison: 500,
    couverture: "/covers/douala.jpg",
    genre: "Policier / Noir",
    tome: 1,
    disponible: true,
    note: 4.7,
    nombreAvis: 29,
    nombreCommandesSemaine: 8,
    avis: [
      {
        nom: "Kevin O.",
        note: 5,
        commentaire:
          "J'habite Douala et je reconnais chaque rue décrite. L'atmosphère est parfaite, le suspense jusqu'à la dernière page !",
        ville: "Douala",
        date: "il y a 4 jours",
        avatar: "K",
      },
      {
        nom: "Marie-Hélène C.",
        note: 4,
        commentaire:
          "Un polar comme je n'en avais jamais lu sur Cameroun. Le personnage de Marcus est très bien écrit. J'attends le tome 2 !",
        ville: "Yaoundé",
        date: "il y a 2 semaines",
        avatar: "M",
      },
      {
        nom: "Thierry N.",
        note: 5,
        commentaire:
          "Commandé un soir, reçu 3 jours après à Bafoussam. Emballage soigné et BD impeccable. Merci !",
        ville: "Bafoussam",
        date: "il y a 3 semaines",
        avatar: "T",
      },
    ],
  },
  {
    id: "bd-005",
    titre: "Ndzana et le Monde Invisible",
    auteur: "Marie-Claire Essono",
    description:
      "Ndzana, jeune garçon beti, découvre qu'il peut voir les esprits. Une aventure fantastique entre tradition et modernité.",
    descriptionLongue:
      "Ndzana a 12 ans et vit dans un village beti à la lisière de la forêt. Un matin, il commence à voir des créatures que personne d'autre ne voit. Son grand-père lui révèle alors un secret familial : il est le gardien du lien entre le monde des vivants et celui des ancêtres. Un récit fantastique et initiatique, tendre et mystérieux, pour toute la famille.",
    pourQui: [
      "Vous aimez les histoires de fantastique et de magie africaine",
      "Vous cherchez une BD pour enfants de 8 à 14 ans",
      "Vous voulez initier les jeunes aux traditions beti",
      "Vous aimez les univers oniriques avec une dimension spirituelle",
    ],
    prix: 2000,
    fraisLivraison: 500,
    couverture: "/covers/ndzana.jpg",
    genre: "Fantastique / Jeunesse",
    disponible: true,
    note: 4.8,
    nombreAvis: 44,
    nombreCommandesSemaine: 16,
    avis: [
      {
        nom: "Bertrand M.",
        note: 5,
        commentaire:
          "Mon fils de 9 ans la lit et relit sans cesse. Il me pose des questions sur nos traditions. Cette BD fait exactement ce qu'elle doit faire.",
        ville: "Ebolowa",
        date: "il y a 1 jour",
        avatar: "B",
      },
      {
        nom: "Christelle V.",
        note: 5,
        commentaire:
          "Magnifique histoire ! Les illustrations rendent bien l'atmosphère mystique des forêts camerounaises. Un vrai bijou.",
        ville: "Yaoundé",
        date: "il y a 5 jours",
        avatar: "C",
      },
      {
        nom: "Alain P.",
        note: 4,
        commentaire:
          "Très belle BD, idéale pour les enfants. Livraison en 2 jours à Yaoundé, service rapide et sérieux.",
        ville: "Yaoundé",
        date: "il y a 2 semaines",
        avatar: "A",
      },
    ],
  },
  {
    id: "bd-006",
    titre: "Champion de Yaoundé",
    auteur: "Roger Ateba",
    description:
      "Le destin de Mbida, gamin des rues de Yaoundé qui rêve de devenir footballeur professionnel malgré tous les obstacles.",
    descriptionLongue:
      "Mbida a grandi dans le quartier de Briqueterie à Yaoundé. Il n'a pas de chaussures, pas de club, pas de famille pour le soutenir. Mais il a un talent brut et une volonté indestructible. Cette BD suit son parcours depuis les terrains vagues jusqu'aux portes des Lions Indomptables. Un récit de courage, de dépassement et d'espoir.",
    pourQui: [
      "Vous êtes passionné de football et d'histoires de sport",
      "Vous aimez les récits de résilience et de dépassement de soi",
      "Vous cherchez une BD motivante pour les jeunes",
      "Vous voulez découvrir le Yaoundé populaire à travers la BD",
    ],
    prix: 2000,
    fraisLivraison: 500,
    couverture: "/covers/champion.jpg",
    genre: "Sport / Drame",
    disponible: false,
    note: 4.6,
    nombreAvis: 0,
    nombreCommandesSemaine: 0,
    avis: [],
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
