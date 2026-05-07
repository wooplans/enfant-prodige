import { catalogue } from "@/lib/catalogue";
import CarteBD from "@/components/CarteBC";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos séries | Enfant Prodige BD",
  description: "Découvrez nos 3 séries de BD personnalisées pour enfants africains de 6 à 10 ans. Pré-commande ouverte.",
};

export default function CataloguePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">✨ Nos séries personnalisées</h1>
        <p className="text-gray-500">
          {catalogue.length} séries disponibles · Pré-commande ouverte · Yaoundé &amp; Douala
        </p>
      </div>

      {/* Badge personnalisation */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
        <span className="text-2xl shrink-0">✨</span>
        <div>
          <div className="font-bold text-purple-800 mb-0.5">Chaque BD est unique</div>
          <p className="text-sm text-purple-600">
            Le prénom de votre enfant est intégré sur la couverture et dans les dialogues. Une BD faite rien que pour lui.
          </p>
        </div>
      </div>

      {/* Grille des séries */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {catalogue.map((bd) => (
          <CarteBD key={bd.id} bd={bd} />
        ))}
      </div>

      {/* Infos livraison */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "💳", titre: "Paiement Mobile Money", texte: "MTN MoMo ou Orange Money, avant la personnalisation." },
          { icon: "🚀", titre: "Livraison en 24h", texte: "Après paiement, votre BD personnalisée est livrée à votre porte." },
          { icon: "📦", titre: "1 000 FCFA à la réception", texte: "Frais de livraison réglés au livreur, aucun paiement caché." },
        ].map(({ icon, titre, texte }) => (
          <div key={titre} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">{icon}</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">{titre}</div>
              <div className="text-xs text-gray-500 mt-0.5">{texte}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
