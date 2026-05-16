"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Comment fonctionne la personnalisation ?",
    a: "Après le paiement en ligne, notre équipe vous contacte via WhatsApp pour confirmer le prénom de votre enfant et le lieu de livraison. Nous insérons ensuite ce prénom sur la couverture et dans les bulles de dialogue de la BD. Vous recevez votre livre unique, imprimé et livré sous 48h.",
  },
  {
    q: "Quand est-ce que je paye ?",
    a: "Vous payez 9 900 FCFA par Mobile Money (MTN MoMo ou Orange Money) directement via Monetbil avant la personnalisation. Les 1 000 FCFA de frais de livraison sont réglés directement au livreur à la réception.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "Une fois votre paiement Mobile Money confirmé, nous personnalisons et imprimons votre BD, puis la livrons sous 24h à Yaoundé et Douala.",
  },
  {
    q: "Ma commande est-elle garantie ?",
    a: "Oui. Si votre BD arrive abîmée ou si le prénom est mal orthographié, contactez-nous immédiatement. Nous corrigeons et relivrons sans frais supplémentaires.",
  },
  {
    q: "Livrez-vous en dehors de Yaoundé et Douala ?",
    a: "Pour l'instant, nous livrons principalement à Yaoundé et Douala. Contactez-nous pour connaître les possibilités pour votre ville — nous faisons de notre mieux pour servir tout le Cameroun.",
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
