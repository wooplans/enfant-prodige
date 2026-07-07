import type { BD } from "@/lib/catalogue";

export const localCatalogue: BD[] = [
  {
    id: "sauve-les-animaux",
    slug: "sauve-les-animaux",
    serie: "Sauve les Animaux",
    titre: "Sauve les Animaux",
    genre: "Animaux · Sauvetage · Aventure",
    description:
      "Votre enfant devient le héros d'une mission pour protéger les animaux et voit son prénom intégré dans l'histoire.",
    descriptionLongue:
      "Dans Sauve les Animaux, votre enfant entre dans une grande mission de sauvetage au cœur d'un parc animalier africain. Il aide à protéger les lions, éléphants, perroquets et gorilles, prend des décisions courageuses et découvre que sa voix compte. Son prénom apparaît sur la couverture et dans les dialogues pour transformer la lecture en aventure personnelle.",
    pourQui: [
      "Votre enfant adore les animaux et les histoires d'aventure",
      "Vous cherchez une BD qui donne envie de lire dès les premières pages",
      "Vous voulez un cadeau original, personnalisé et facile à commander",
      "Vous voulez une histoire qui mélange émotion, action et découverte",
    ],
    prix: 9900,
    fraisLivraison: 1000,
    couverture: "/covers/exploration-zoo.jpg",
    galerie: [
      "/covers/exploration-zoo.jpg",
      "/covers/exploration-zoo-scene.jpg",
      "/covers/exploration-zoo-heros.jpg",
      "/covers/exploration-zoo-detail.jpg",
    ],
    nombrePages: 32,
    ageMin: 6,
    ageMax: 10,
    disponible: true,
    landingPageMode: true,
    note: 4.8,
    nombreAvis: 16,
    nombreCommandesSemaine: 11,
    avis: [
      {
        nom: "Clarisse N.",
        note: 5,
        commentaire:
          "Ma fille a tout de suite voulu savoir ce qui arrivait aux animaux. Quand elle a vu son prénom dans l'histoire, elle ne voulait plus lâcher la BD.",
        ville: "Douala",
        date: "il y a 3 jours",
        avatar: "C",
      },
      {
        nom: "Marius E.",
        note: 5,
        commentaire:
          "Très belle idée de cadeau. Mon fils adore les lions, et la commande sur WhatsApp était simple.",
        ville: "Yaoundé",
        date: "il y a 6 jours",
        avatar: "M",
      },
      {
        nom: "Aïcha T.",
        note: 4,
        commentaire:
          "Les dessins sont beaux et l'histoire tient bien l'attention des enfants. Très bon retour après la livraison.",
        ville: "Bafoussam",
        date: "il y a 2 semaines",
        avatar: "A",
      },
    ],
  },
  {
    id: "decouvre-les-metiers",
    slug: "decouvre-les-metiers",
    serie: "Découvre les Métiers",
    titre: "Découvre les Métiers",
    genre: "Métiers · Découverte · Avenir",
    description:
      "Votre enfant découvre des métiers inspirants, comprend leur rôle et voit son prénom intégré dans une aventure qui l'aide à imaginer son avenir.",
    descriptionLongue:
      "Dans Découvre les Métiers, votre enfant avance de découverte en découverte pour comprendre à quoi servent différents métiers, comment chacun aide les autres et ce qui peut faire naître une vocation. Son prénom apparaît sur la couverture et dans les dialogues pour transformer la lecture en expérience personnelle, joyeuse et motivante.",
    pourQui: [
      "Votre enfant pose beaucoup de questions sur ce que font les adultes",
      "Vous cherchez une BD éducative qui ouvre l'imagination et la curiosité",
      "Vous voulez un cadeau personnalisé, utile et facile à commander",
      "Vous voulez prolonger la lecture avec des activités et des coloriages",
    ],
    prix: 9900,
    fraisLivraison: 1000,
    couverture: "/decouvre-les-metiers/cover.png",
    galerie: [
      "/decouvre-les-metiers/cover.png",
      "/decouvre-les-metiers/hero-discovery.png",
      "/decouvre-les-metiers/hero-planning.png",
      "/decouvre-les-metiers/hero-future.png",
    ],
    nombrePages: 32,
    ageMin: 6,
    ageMax: 10,
    disponible: true,
    landingPageMode: true,
    note: 4.9,
    nombreAvis: 19,
    nombreCommandesSemaine: 12,
    avis: [
      {
        nom: "Murielle F.",
        note: 5,
        commentaire:
          "Mon fils a commencé à me parler du métier de médecin et de ce qu'il voudrait faire plus tard. La BD l'a vraiment fait réfléchir avec plaisir.",
        ville: "Douala",
        date: "il y a 4 jours",
        avatar: "M",
      },
      {
        nom: "Steve K.",
        note: 5,
        commentaire:
          "Très bonne idée de cadeau. Ma fille était fière de voir son prénom dans l'histoire et a adoré les activités après la lecture.",
        ville: "Yaoundé",
        date: "il y a 1 semaine",
        avatar: "S",
      },
      {
        nom: "Agnès T.",
        note: 4,
        commentaire:
          "Le thème est utile, ludique et facile à comprendre pour un enfant. La commande sur WhatsApp s'est faite sans difficulté.",
        ville: "Bafoussam",
        date: "il y a 2 semaines",
        avatar: "A",
      },
    ],
  },
  {
    id: "academie-genies",
    slug: "academie-genies",
    serie: "Académie des Génies",
    titre: "Académie des Génies",
    genre: "Science · Entrepreneuriat · Ambition",
    description:
      "Votre garçon rejoint l'Académie des Génies pour résoudre une grande énigme scientifique qui menace toute l'Afrique. Son prénom apparaît sur la couverture et dans les dialogues.",
    descriptionLongue:
      "Dans cette aventure sur mesure, votre garçon est recruté par l'Académie des Génies — une école secrète pour les jeunes esprits les plus brillants d'Afrique. Armé de sa curiosité et de son intelligence, il doit déchiffrer un mystère scientifique qui menace tout le continent. Son prénom apparaît sur la couverture, dans les bulles de dialogue et au cœur de l'histoire. 32 pages illustrées pleine couleur, format A4, style sketch vibrant.",
    pourQui: [
      "Votre garçon est curieux, aime les sciences et les expériences",
      "Vous voulez l'encourager à croire en ses capacités",
      "Vous cherchez un cadeau unique, mémorable et personnalisé",
      "Vous voulez un livre où votre garçon se voit comme un héros",
    ],
    prix: 9900,
    fraisLivraison: 1000,
    couverture: "/covers/academie-genies.jpg",
    galerie: [
      "/covers/academie-genies.jpg",
      "/covers/academie-genies-scene.jpg",
      "/covers/academie-genies-heros.jpg",
      "/covers/academie-genies-detail.jpg",
    ],
    nombrePages: 32,
    ageMin: 7,
    ageMax: 12,
    disponible: true,
    landingPageMode: false,
    note: 4.9,
    nombreAvis: 23,
    nombreCommandesSemaine: 17,
    avis: [
      {
        nom: "Cécile M.",
        note: 5,
        commentaire:
          "Mon fils de 8 ans a pleuré de joie en voyant son prénom sur la couverture ! Il a lu le livre 4 fois en une semaine. Un cadeau extraordinaire.",
        ville: "Yaoundé",
        date: "il y a 2 jours",
        avatar: "C",
      },
      {
        nom: "Joseph T.",
        note: 5,
        commentaire:
          "Livré en moins de 24h à Douala comme promis. Les illustrations sont magnifiques et mon fils est fier de se voir en héros africain.",
        ville: "Douala",
        date: "il y a 5 jours",
        avatar: "J",
      },
      {
        nom: "Aminata F.",
        note: 4,
        commentaire:
          "Cadeau d'anniversaire pour mon fils de 7 ans. Il a adoré ! Le paiement Mobile Money était simple et rapide. Je recommande.",
        ville: "Yaoundé",
        date: "il y a 2 semaines",
        avatar: "A",
      },
    ],
  },
  {
    id: "apprentis-explorateurs",
    slug: "apprentis-explorateurs",
    serie: "Les Apprentis Explorateurs",
    titre: "Les Apprentis Explorateurs",
    genre: "Aventure · Géographie africaine",
    description:
      "Votre enfant part explorer les merveilles de l'Afrique aux côtés d'une équipe d'aventuriers. Des savanes aux forêts tropicales, une aventure géographique unique avec son prénom dans l'histoire.",
    descriptionLongue:
      "Votre enfant est invité à rejoindre l'équipe des Apprentis Explorateurs pour une expédition à travers les plus beaux paysages d'Afrique : la savane du Cameroun, les chutes de la Lobé, le lac Tchad et bien plus encore. Guidé par ses compagnons, il découvre la géographie, les animaux et les cultures de son continent. Son prénom est tissé tout au long des 32 pages illustrées, pleine couleur, format A4.",
    pourQui: [
      "Votre enfant aime les aventures, les voyages et la découverte",
      "Vous voulez lui faire découvrir la richesse géographique de l'Afrique",
      "Vous cherchez un cadeau éducatif qui stimule la curiosité",
      "Vous voulez une BD avec des héros qui lui ressemblent",
    ],
    prix: 9900,
    fraisLivraison: 1000,
    couverture: "/covers/apprentis-explorateurs.jpg",
    galerie: [
      "/covers/apprentis-explorateurs.jpg",
      "/covers/apprentis-explorateurs-scene.jpg",
      "/covers/apprentis-explorateurs-heros.jpg",
      "/covers/apprentis-explorateurs-detail.jpg",
    ],
    nombrePages: 32,
    ageMin: 6,
    ageMax: 10,
    disponible: true,
    landingPageMode: false,
    note: 4.8,
    nombreAvis: 18,
    nombreCommandesSemaine: 12,
    avis: [
      {
        nom: "Rodrigue N.",
        note: 5,
        commentaire:
          "Ma fille de 9 ans n'arrête pas de me poser des questions sur les pays africains après avoir lu ce livre ! C'est exactement l'effet que je voulais.",
        ville: "Douala",
        date: "il y a 3 jours",
        avatar: "R",
      },
      {
        nom: "Marie-Hélène K.",
        note: 5,
        commentaire:
          "Personnalisation parfaite, le prénom de mon fils est bien intégré dans les dialogues. Belle qualité d'impression. Livraison ponctuelle.",
        ville: "Bafoussam",
        date: "il y a 1 semaine",
        avatar: "M",
      },
      {
        nom: "Patrick E.",
        note: 4,
        commentaire:
          "Beau cadeau pour les 7 ans de ma nièce. Elle a adoré voir son prénom dans l'histoire. Paiement Mobile Money sans problème.",
        ville: "Yaoundé",
        date: "il y a 3 semaines",
        avatar: "P",
      },
    ],
  },
  {
    id: "exploration-zoo",
    slug: "exploration-zoo",
    serie: "Exploration du ZOO",
    titre: "Exploration du ZOO",
    genre: "Nature · Animaux · Découverte",
    description:
      "Votre enfant va en aventure dans un zoo : découverte et apprentissage en compagnie de son guide.",
    descriptionLongue:
      "Votre enfant passe la plus belle journée de sa vie dans le plus grand zoo d'Afrique ! Accompagné par Kamo le gardien, il rencontre des éléphants, des gorilles, des lions et des perroquets multicolores — tous avec des histoires et des secrets à partager. Une BD éducative et tendre, pleine de découvertes sur le règne animal africain. 32 pages illustrées, pleine couleur, format A4, avec le prénom de votre enfant sur la couverture et dans les dialogues.",
    pourQui: [
      "Votre enfant aime les animaux et la nature",
      "Vous cherchez une BD éducative et ludique pour les 6-10 ans",
      "Vous voulez un cadeau doux et coloré qui éveille la curiosité",
      "Vous voulez initier votre enfant à la faune africaine",
    ],
    prix: 9900,
    fraisLivraison: 1000,
    couverture: "/covers/exploration-zoo.jpg",
    galerie: [
      "/covers/exploration-zoo.jpg",
      "/covers/exploration-zoo-scene.jpg",
      "/covers/exploration-zoo-heros.jpg",
      "/covers/exploration-zoo-detail.jpg",
    ],
    nombrePages: 32,
    ageMin: 6,
    ageMax: 10,
    disponible: true,
    landingPageMode: false,
    note: 4.7,
    nombreAvis: 14,
    nombreCommandesSemaine: 9,
    avis: [
      {
        nom: "Bertrand M.",
        note: 5,
        commentaire:
          "Mon fils de 6 ans adore les animaux. En voyant son prénom dans le livre avec le lion, il a sauté de joie ! Qualité d'impression excellente.",
        ville: "Yaoundé",
        date: "il y a 4 jours",
        avatar: "B",
      },
      {
        nom: "Sophie A.",
        note: 4,
        commentaire:
          "Très belle BD pour les petits. Les dessins sont colorés et expressifs. Ma fille a demandé à ce qu'on lui lise deux fois de suite.",
        ville: "Douala",
        date: "il y a 10 jours",
        avatar: "S",
      },
      {
        nom: "Thierry O.",
        note: 5,
        commentaire:
          "Cadeau parfait. La personnalisation est bien faite, le prénom s'intègre naturellement dans les dialogues. Livraison en 24h, impeccable.",
        ville: "Yaoundé",
        date: "il y a 2 semaines",
        avatar: "T",
      },
    ],
  },
];
