import { WHATSAPP_NUMBER } from "@/lib/catalogue";
import SiteChrome from "@/components/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Enfant Prodige BD",
  description: "Contactez-nous pour commander votre BD personnalisée ou pour toute question.",
};

export default function ContactPage() {
  const message = encodeURIComponent(
    "Bonjour ! J'ai une question concernant vos BD personnalisées."
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <SiteChrome>
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Contactez-nous</h1>
        <p className="text-gray-600">
          Une question sur la personnalisation, le paiement ou la livraison ? Notre équipe est
          disponible sur WhatsApp.
        </p>
      </div>

      {/* Carte WhatsApp */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="#16a34a" className="w-9 h-9">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Discutez avec nous sur WhatsApp</h2>
        <p className="text-gray-600 text-sm mb-6">
          Disponible de <strong>8h à 20h</strong>, 7j/7. Réponse en quelques minutes.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg"
        >
          📱 Ouvrir WhatsApp
        </a>
      </div>

      {/* FAQ rapide */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Questions fréquentes</h3>
        {[
          {
            q: "Comment fonctionne la personnalisation ?",
            a: "Vous indiquez le prénom de votre enfant lors de la commande. Notre équipe l'intègre sur la couverture et dans les dialogues de la BD avant impression.",
          },
          {
            q: "Quand est-ce que je paye ?",
            a: "Vous payez 9 900 FCFA par Mobile Money (MTN MoMo ou Orange Money) après confirmation sur WhatsApp, avant la personnalisation. Les 1 000 FCFA de frais de livraison sont payés au livreur à la réception.",
          },
          {
            q: "Quel est le délai de livraison ?",
            a: "Une fois votre commande confirmée par WhatsApp, nous personnalisons votre BD et l'expédions sous 48h partout au Cameroun.",
          },
          {
            q: "Livrez-vous dans toutes les villes du Cameroun ?",
            a: "Oui ! Nous expédions dans toutes les villes du Cameroun. Frais d'expédition : 1 000 FCFA, payés à la réception du colis.",
          },
        ].map(({ q, a }) => (
          <details
            key={q}
            className="bg-white border border-gray-100 rounded-xl px-5 py-4 cursor-pointer group"
          >
            <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
              {q}
              <span className="text-green-600 group-open:rotate-45 transition-transform text-xl leading-none">
                +
              </span>
            </summary>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
    </SiteChrome>
  );
}
