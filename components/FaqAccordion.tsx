"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Comment se passe la livraison ?",
    a: "Nous livrons partout au Cameroun sous 2 à 5 jours ouvrables. Après votre commande WhatsApp, nous vous confirmons le délai selon votre ville. La BD vous est remise en main propre par notre livreur.",
  },
  {
    q: "Quand est-ce que je paye ?",
    a: "Vous payez uniquement à la réception de votre BD. Le livreur vous remet le livre, vous vérifiez qu'il est en bon état, puis vous réglez le montant total (prix BD + frais de livraison). Aucun paiement à l'avance.",
  },
  {
    q: "Que faire si je ne suis pas satisfait ?",
    a: "Si votre BD arrive abîmée ou si ce n'est pas le bon titre, contactez-nous immédiatement sur WhatsApp. Nous arrangerons un remplacement sans frais supplémentaires.",
  },
  {
    q: "Puis-je commander plusieurs BD en même temps ?",
    a: "Oui ! Précisez simplement les titres souhaités dans votre message WhatsApp. Les frais de livraison restent forfaitaires, quel que soit le nombre de BD commandées.",
  },
  {
    q: "Livrez-vous hors de Douala et Yaoundé ?",
    a: "Oui, nous livrons dans toutes les villes du Cameroun : Bafoussam, Garoua, Maroua, Ngaoundéré, Bertoua, Ebolowa et plus. Le délai peut être légèrement plus long selon la région.",
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
            <span className={`text-green-600 text-lg font-bold transition-transform shrink-0 ${ouvert === i ? "rotate-45" : ""}`}>
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
