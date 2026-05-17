"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Est-ce que mon garçon apparaît vraiment dans la BD ?",
    a: "Oui. Son prénom apparaît sur la couverture et dans les bulles de dialogue de l'histoire. Après le paiement, notre équipe vous contacte sur WhatsApp pour confirmer l'orthographe exacte avant l'impression.",
  },
  {
    q: "À quel âge cette BD est-elle adaptée ?",
    a: "Académie des Génies est pensée pour les garçons de 7 à 12 ans. L'histoire est simple à suivre, valorisante et assez dynamique pour intéresser aussi les enfants qui ne lisent pas beaucoup.",
  },
  {
    q: "Est-ce un livre physique ou un fichier numérique ?",
    a: "Vous recevez une vraie BD imprimée en couleur. Ce n'est pas un PDF : c'est un livre personnalisé que votre garçon peut lire, garder et montrer autour de lui.",
  },
  {
    q: "Quand est-ce que je paye ?",
    a: "Vous payez 9 900 FCFA par MTN Mobile Money ou Orange Money directement en ligne. Les 1 000 FCFA de frais de livraison sont réglés directement au livreur à la réception.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "Une fois votre paiement Mobile Money confirmé, nous personnalisons et imprimons votre BD, puis la livrons sous 24h à Yaoundé et Douala.",
  },
  {
    q: "Que se passe-t-il si je me trompe dans le prénom ?",
    a: "Nous confirmons le prénom sur WhatsApp avant l'impression. Si une erreur vient de notre équipe, nous corrigeons et relivrons sans frais supplémentaires.",
  },
  {
    q: "Livrez-vous en dehors de Yaoundé et Douala ?",
    a: "Pour cette phase de test, nous livrons uniquement à Douala et Yaoundé afin de garantir un bon suivi et une livraison rapide.",
  },
  {
    q: "Ma commande est-elle garantie ?",
    a: "Oui. Si la BD arrive abîmée ou si le prénom est mal imprimé à cause d'une erreur de notre côté, contactez-nous immédiatement. Nous corrigeons la commande.",
  },
];

interface Props {
  deliveryDateLabel?: string;
}

export default function FaqAccordion({ deliveryDateLabel }: Props) {
  const [ouvert, setOuvert] = useState<number | null>(null);
  const deliveryAnswer = deliveryDateLabel
    ? `En payant maintenant, on vous livre ${deliveryDateLabel}. Vous recevez ensuite votre BD personnalisée sous 48h à Yaoundé et Douala.`
    : "Une fois votre paiement Mobile Money confirmé, nous personnalisons et imprimons votre BD, puis la livrons sous 48h à Yaoundé et Douala.";

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
                {faq.q === "Quel est le délai de livraison ?" ? deliveryAnswer : faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
