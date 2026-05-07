"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Comment fonctionne la personnalisation ?",
    a: "Après votre commande WhatsApp, vous indiquez le prénom de votre enfant (et son sexe). Notre équipe insère ce prénom sur la couverture et dans les bulles de dialogue de la BD. Vous recevez ensuite votre livre unique, imprimé et livré sous 24h.",
  },
  {
    q: "Quand est-ce que je paye ?",
    a: "Vous payez 9 900 FCFA par Mobile Money (MTN MoMo ou Orange Money) après confirmation de votre commande sur WhatsApp — avant la personnalisation. Les 1 000 FCFA de frais de livraison sont réglés directement au livreur à la réception.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "Une fois votre paiement Mobile Money confirmé, nous personnalisons et imprimons votre BD, puis la livrons sous 24h à Yaoundé et Douala.",
  },
  {
    q: "Ma commande est-elle garantie ?",
    a: "Oui. Si votre BD arrive abîmée ou si le prénom est mal orthographié, contactez-nous immédiatement sur WhatsApp. Nous corrigeons et relivrons sans frais supplémentaires.",
  },
  {
    q: "Livrez-vous en dehors de Yaoundé et Douala ?",
    a: "Pour l'instant, nous livrons principalement à Yaoundé et Douala. Contactez-nous sur WhatsApp pour connaître les possibilités pour votre ville — nous faisons de notre mieux pour servir tout le Cameroun.",
  },
];

export default function FaqAccordion() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full text-left px-4 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setOuvert(ouvert === i ? null : i)}
          >
            <span className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</span>
            <span
              className={`text-green-600 text-lg font-bold transition-transform shrink-0 ${
                ouvert === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          {ouvert === i && (
            <div className="px-4 pb-4 bg-white">
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
