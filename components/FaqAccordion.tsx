"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Est-ce vraiment personnalisé avec le prénom de MON fils ?",
    a: "Oui, complètement. Le prénom de votre garçon est intégré directement dans les illustrations et dans les dialogues de la BD — pas juste sur une étiquette collée. Chaque exemplaire est imprimé spécialement pour lui.",
  },
  {
    q: "Comment je paye ?",
    a: "Vous payez 9 900 FCFA directement depuis votre téléphone par Orange Money ou MTN Mobile Money — sans avoir besoin d'aller à une agence. Les 1 000 FCFA de frais d'expédition sont payés à la réception du colis.",
  },
  {
    q: "Que se passe-t-il après le paiement ?",
    a: "Notre équipe vous contacte sur WhatsApp dans les 30 minutes pour confirmer le prénom exact de votre garçon et valider le lieu de livraison. On imprime ensuite la BD et on vous livre sous 48h.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "Une fois votre paiement confirmé, nous expédions sous 48h partout au Cameroun.",
  },
  {
    q: "Et si mon fils n'aime pas ?",
    a: "Nous offrons une garantie satisfait ou remboursé de 7 jours. Si la BD ne fait pas sourire votre garçon, contactez-nous et nous vous remboursons intégralement — sans conditions.",
  },
  {
    q: "Comment fonctionne la personnalisation en détail ?",
    a: "Après le paiement, vous nous confirmez le prénom sur WhatsApp. Nos illustrateurs intègrent ce prénom sur la couverture et dans les dialogues. La BD est ensuite imprimée en couleur sur papier de qualité et livrée chez vous.",
  },
  {
    q: "Livrez-vous dans toutes les villes du Cameroun ?",
    a: "Oui ! Nous expédions dans toutes les villes du Cameroun. Frais d'expédition : 1 000 FCFA, payés à la réception du colis.",
  },
  {
    q: "Mon fils sait-il déjà lire ? Est-ce pour quel âge ?",
    a: "La BD est conçue pour les garçons de 7 ans et plus. Les textes sont courts, les dialogues vivants et les illustrations très expressives. Un enfant qui commence à lire peut la parcourir seul ou avec vous — c'est souvent l'occasion d'un moment de lecture partagée inoubliable.",
  },
  {
    q: "Je ne suis pas sûre que mon fils aimera les BD. Et si ça ne l'intéresse pas ?",
    a: "C'est rare — et pour cause : voir son propre prénom dans un livre change tout. Les parents qui hésitaient nous rapportent presque toujours que leur fils a été bluffé et l'a relu plusieurs fois. Et si vraiment il n'accroche pas, notre garantie satisfait ou remboursé de 7 jours s'applique sans question.",
  },
  {
    q: "Est-ce que la qualité d'impression est vraiment bonne ?",
    a: "Oui. Nous imprimons sur papier couché 150 g/m², format A4, avec des illustrations pleine couleur. C'est une BD solide, avec un rendu professionnel — pas un simple document imprimé à la maison. Plusieurs parents nous ont dit que la qualité les avait surpris positivement.",
  },
  {
    q: "Puis-je commander la BD comme cadeau d'anniversaire de dernière minute ?",
    a: "Oui, tant que vous commandez au moins 48h à l'avance. Dès que votre paiement est confirmé, notre équipe vous contacte sur WhatsApp dans les 30 minutes. Nous personnalisons la BD et la livrons sous 48h à Yaoundé et Douala — juste à temps pour l'anniversaire.",
  },
];

interface Props {
  deliveryDateLabel?: string;
}

export default function FaqAccordion({ deliveryDateLabel }: Props) {
  const [ouvert, setOuvert] = useState<number | null>(null);
  const deliveryAnswer = deliveryDateLabel
    ? `En payant maintenant, votre colis est expédié ${deliveryDateLabel}. Vous recevez votre BD personnalisée sous 48h partout au Cameroun.`
    : "Une fois votre paiement Mobile Money confirmé, nous personnalisons et imprimons votre BD, puis l'expédions sous 48h partout au Cameroun.";

  return (
    <div className="divide-y divide-amber-200 border-y border-amber-200">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-green-800"
            onClick={() => setOuvert(ouvert === i ? null : i)}
          >
            <span className="pr-4 text-base font-extrabold leading-snug text-gray-950">{faq.q}</span>
            <span
              className={`shrink-0 text-xl font-bold text-green-700 transition-transform duration-200 ${
                ouvert === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          {ouvert === i && (
            <div className="pb-5">
              <p className="max-w-3xl text-sm leading-7 text-gray-700">
                {faq.q === "Quel est le délai de livraison ?" && deliveryDateLabel ? deliveryAnswer : faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
