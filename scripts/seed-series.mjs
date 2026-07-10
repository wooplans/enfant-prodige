import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_SERIES_BUCKET || "series-images";

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
    nombre_avis: 23,
    nombre_commandes_semaine: 17,
    sort_order: 10,
    avis: [
      { nom: "Cécile M.", note: 5, commentaire: "Mon fils de 8 ans a pleuré de joie en voyant son prénom sur la couverture ! Il a lu le livre 4 fois en une semaine. Un cadeau extraordinaire.", ville: "Yaoundé", date: "il y a 2 jours", avatar: "C" },
      { nom: "Joseph T.", note: 5, commentaire: "Livré en moins de 24h à Douala comme promis. Les illustrations sont magnifiques et mon fils est fier de se voir en héros africain.", ville: "Douala", date: "il y a 5 jours", avatar: "J" },
      { nom: "Aminata F.", note: 4, commentaire: "Cadeau d'anniversaire pour ma fille de 7 ans. Elle a adoré ! Le paiement Mobile Money était simple et rapide. Je recommande.", ville: "Yaoundé", date: "il y a 2 semaines", avatar: "A" },
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
    slug: "sauve-les-animaux",
    serie: "Sauve les animaux",
    titre: "Sauve les animaux",
    genre: "Nature · Animaux · Empathie · Coloriage",
    description:
      "Votre enfant devient un héros de la nature en volant au secours de 15 animaux. Une BD éducative et personnalisée avec fiches documentaires et 15 pages de coloriages !",
    description_longue:
      "Dans cette grande aventure sur mesure, votre enfant (dont le prénom apparaît sur la couverture et dans toutes les histoires) parcourt la savane et la forêt équatoriale pour aider 10 animaux en difficulté : Tembo l'éléphanteau assoiffé, Simba le lionceau blessé, Zara la girafe craintive, Kongo le petit gorille égaré... Chaque histoire est accompagnée de fiches éducatives captivantes (À retenir sur...) et de pages de coloriage pour chaque animal. 62 pages d'activités haute qualité, format A4, combinant lecture personnalisée, apprentissage scientifique et coloriage.",
    pour_qui: [
      "Votre enfant adore les animaux et la nature sauvage d'Afrique",
      "Vous voulez développer son empathie, sa bienveillance et son goût de la lecture",
      "Vous cherchez un livre d'activités 3-en-1 : BD personnalisée, fiches documentaires et dessins à colorier",
      "Idéal pour les enfants de 4 à 10 ans (apprentissage ludique de la faune africaine)",
    ],
    prix: 9900,
    frais_livraison: 1000,
    images: [
      "/covers/sauve-les-animaux-cover.jpg",
      "/covers/sauve-les-animaux-girl.jpg",
      "/covers/sauve-les-animaux-boy.jpg",
      "/covers/sauve-les-animaux-family.jpg",
    ],
    nombre_pages: 62,
    age_min: 4,
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

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function uploadPublicAsset(publicPath, slug) {
  const relativePath = publicPath.replace(/^\//, "");
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  const buffer = await readFile(absolutePath);
  const storagePath = `${slug}/${path.basename(relativePath)}`;

  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: contentTypeFor(relativePath),
    upsert: true,
  });

  if (error) throw new Error(`Storage upload failed for ${publicPath}: ${error.message}`);

  return supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

for (const item of catalogue) {
  const imageUrls = await Promise.all(item.images.map((image) => uploadPublicAsset(image, item.slug)));
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
