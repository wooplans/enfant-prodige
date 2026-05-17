import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bd.wooplans.com";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const catalogue = [
  {
    slug: "academie-genies",
    serie: "Académie des Génies",
    titre: "Académie des Génies",
    genre: "Science · Entrepreneuriat · Ambition",
    description:
      "Votre enfant rejoint l'Académie des Génies pour résoudre une grande énigme scientifique qui menace toute l'Afrique. Son prénom apparaît sur la couverture et dans les dialogues.",
    description_longue:
      "Dans cette aventure sur mesure, votre enfant est recruté par l'Académie des Génies — une école secrète pour les jeunes esprits les plus brillants d'Afrique. Armé de sa curiosité et de son intelligence, il doit déchiffrer un mystère scientifique qui menace tout le continent. Son prénom apparaît sur la couverture, dans les bulles de dialogue et au cœur de l'histoire. 32 pages illustrées pleine couleur, format A4, style sketch vibrant.",
    pour_qui: [
      "Votre enfant est curieux, aime les sciences et les expériences",
      "Vous voulez l'encourager à croire en ses capacités",
      "Vous cherchez un cadeau unique, mémorable et personnalisé",
      "Vous voulez un livre où votre enfant se voit comme un héros",
    ],
    prix: 9900,
    frais_livraison: 1000,
    images: [
      "/covers/academie-genies.jpg",
      "/covers/academie-genies-scene.jpg",
      "/covers/academie-genies-heros.jpg",
      "/covers/academie-genies-detail.jpg",
    ],
    nombre_pages: 32,
    age_min: 6,
    age_max: 10,
    note: 4.9,
    nombre_avis: 31,
    nombre_commandes_semaine: 17,
    sort_order: 10,
    avis: [
      { nom: "Cécile M.", note: 5, commentaire: "Mon fils de 8 ans a crié de joie quand il a vu son prénom sur la couverture ! Il l'a lue 4 fois en une semaine. C'est le meilleur cadeau qu'il ait jamais reçu.", ville: "Yaoundé", date: "il y a 2 jours", avatar: "C" },
      { nom: "Joseph T.", note: 5, commentaire: "Livré à Bonapriso en moins de 48h comme promis. Les illustrations sont magnifiques et mon fils est fier de se voir en héros africain. Le paiement MTN MoMo était simple.", ville: "Douala", date: "il y a 5 jours", avatar: "J" },
      { nom: "Armelle N.", note: 5, commentaire: "J'avais des doutes au départ — commander un livre en ligne au Cameroun… Mais la livraison a été rapide, le livre est beau, et mon fils de 9 ans ne le lâche plus. Vraiment impressionnée.", ville: "Yaoundé", date: "il y a 1 semaine", avatar: "A" },
      { nom: "Patrick K.", note: 5, commentaire: "Cadeau d'anniversaire pour mon neveu de 10 ans. Sa réaction quand il a vu son prénom sur la couverture était incroyable. Toute la famille a voulu voir le livre.", ville: "Douala", date: "il y a 10 jours", avatar: "P" },
      { nom: "Solange B.", note: 5, commentaire: "Le service WhatsApp est top — ils m'ont contactée dans les 20 minutes après le paiement pour confirmer. Mon fils adore son héros qui s'appelle comme lui !", ville: "Yaoundé", date: "il y a 2 semaines", avatar: "S" },
      { nom: "Rodrigue E.", note: 4, commentaire: "Très bonne initiative. Mon fils de 7 ans a insisté pour emmener sa BD à l'école pour la montrer à ses amis. Le prénom bien intégré dans les dialogues, pas juste sur la couverture.", ville: "Douala", date: "il y a 3 semaines", avatar: "R" },
      { nom: "Aminata F.", note: 4, commentaire: "Commande faite un samedi matin, livrée le lundi à Bastos. Paiement Orange Money rapide. Mon fils se voit vraiment comme un génie maintenant — trop mignon !", ville: "Yaoundé", date: "il y a 1 mois", avatar: "A" },
    ],
  },
  {
    slug: "apprentis-explorateurs",
    serie: "Les Apprentis Explorateurs",
    titre: "Les Apprentis Explorateurs",
    genre: "Aventure · Géographie africaine",
    description:
      "Votre enfant part explorer les merveilles de l'Afrique aux côtés d'une équipe d'aventuriers. Des savanes aux forêts tropicales, une aventure géographique unique avec son prénom dans l'histoire.",
    description_longue:
      "Votre enfant est invité à rejoindre l'équipe des Apprentis Explorateurs pour une expédition à travers les plus beaux paysages d'Afrique : la savane du Cameroun, les chutes de la Lobé, le lac Tchad et bien plus encore. Guidé par ses compagnons, il découvre la géographie, les animaux et les cultures de son continent. Son prénom est tissé tout au long des 32 pages illustrées, pleine couleur, format A4.",
    pour_qui: [
      "Votre enfant aime les aventures, les voyages et la découverte",
      "Vous voulez lui faire découvrir la richesse géographique de l'Afrique",
      "Vous cherchez un cadeau éducatif qui stimule la curiosité",
      "Vous voulez une BD avec des héros qui lui ressemblent",
    ],
    prix: 9900,
    frais_livraison: 1000,
    images: [
      "/covers/apprentis-explorateurs.jpg",
      "/covers/apprentis-explorateurs-scene.jpg",
      "/covers/apprentis-explorateurs-heros.jpg",
      "/covers/apprentis-explorateurs-detail.jpg",
    ],
    nombre_pages: 32,
    age_min: 6,
    age_max: 10,
    note: 4.8,
    nombre_avis: 18,
    nombre_commandes_semaine: 12,
    sort_order: 20,
    avis: [
      { nom: "Rodrigue N.", note: 5, commentaire: "Ma fille de 9 ans n'arrête pas de me poser des questions sur les pays africains après avoir lu ce livre ! C'est exactement l'effet que je voulais.", ville: "Douala", date: "il y a 3 jours", avatar: "R" },
      { nom: "Marie-Hélène K.", note: 5, commentaire: "Personnalisation parfaite, le prénom de mon fils est bien intégré dans les dialogues. Belle qualité d'impression. Livraison ponctuelle.", ville: "Bafoussam", date: "il y a 1 semaine", avatar: "M" },
      { nom: "Patrick E.", note: 4, commentaire: "Beau cadeau pour les 7 ans de ma nièce. Elle a adoré voir son prénom dans l'histoire. Paiement Mobile Money sans problème.", ville: "Yaoundé", date: "il y a 3 semaines", avatar: "P" },
    ],
  },
  {
    slug: "exploration-zoo",
    serie: "Exploration du ZOO",
    titre: "Exploration du ZOO",
    genre: "Nature · Animaux · Découverte",
    description:
      "Votre enfant va en aventure dans un zoo : découverte et apprentissage en compagnie de son guide.",
    description_longue:
      "Votre enfant passe la plus belle journée de sa vie dans le plus grand zoo d'Afrique ! Accompagné par Kamo le gardien, il rencontre des éléphants, des gorilles, des lions et des perroquets multicolores — tous avec des histoires et des secrets à partager. Une BD éducative et tendre, pleine de découvertes sur le règne animal africain. 32 pages illustrées, pleine couleur, format A4, avec le prénom de votre enfant sur la couverture et dans les dialogues.",
    pour_qui: [
      "Votre enfant aime les animaux et la nature",
      "Vous cherchez une BD éducative et ludique pour les 6-10 ans",
      "Vous voulez un cadeau doux et coloré qui éveille la curiosité",
      "Vous voulez initier votre enfant à la faune africaine",
    ],
    prix: 9900,
    frais_livraison: 1000,
    images: [
      "/covers/exploration-zoo.jpg",
      "/covers/exploration-zoo-scene.jpg",
      "/covers/exploration-zoo-heros.jpg",
      "/covers/exploration-zoo-detail.jpg",
    ],
    nombre_pages: 32,
    age_min: 6,
    age_max: 10,
    note: 4.7,
    nombre_avis: 14,
    nombre_commandes_semaine: 9,
    sort_order: 30,
    avis: [
      { nom: "Bertrand M.", note: 5, commentaire: "Mon fils de 6 ans adore les animaux. En voyant son prénom dans le livre avec le lion, il a sauté de joie ! Qualité d'impression excellente.", ville: "Yaoundé", date: "il y a 4 jours", avatar: "B" },
      { nom: "Sophie A.", note: 4, commentaire: "Très belle BD pour les petits. Les dessins sont colorés et expressifs. Ma fille a demandé à ce qu'on lui lise deux fois de suite.", ville: "Douala", date: "il y a 10 jours", avatar: "S" },
      { nom: "Thierry O.", note: 5, commentaire: "Cadeau parfait. La personnalisation est bien faite, le prénom s'intègre naturellement dans les dialogues. Livraison en 24h, impeccable.", ville: "Yaoundé", date: "il y a 2 semaines", avatar: "T" },
    ],
  },
];

function publicAssetUrl(publicPath) {
  return new URL(publicPath, siteUrl).toString();
}

for (const item of catalogue) {
  const imageUrls = item.images.map((image) => publicAssetUrl(image));
  const [coverUrl] = imageUrls;

  const { error } = await supabase.from("series").upsert(
    {
      slug: item.slug,
      serie: item.serie,
      titre: item.titre,
      genre: item.genre,
      description: item.description,
      description_longue: item.description_longue,
      pour_qui: item.pour_qui,
      prix: item.prix,
      frais_livraison: item.frais_livraison,
      couverture_url: coverUrl,
      galerie_urls: imageUrls,
      nombre_pages: item.nombre_pages,
      age_min: item.age_min,
      age_max: item.age_max,
      disponible: true,
      published: true,
      archived_at: null,
      note: item.note,
      nombre_avis: item.nombre_avis,
      nombre_commandes_semaine: item.nombre_commandes_semaine,
      avis: item.avis,
      sort_order: item.sort_order,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

  if (error) throw new Error(`Series upsert failed for ${item.slug}: ${error.message}`);
  console.log(`Seeded ${item.slug}`);
}
