import { getPublicCatalogue } from "@/lib/series";
import CarteBD from "@/components/CarteBC";
import SiteChrome from "@/components/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos séries | Enfant Prodige BD",
  description: "Découvrez nos 3 séries de BD personnalisées pour enfants africains de 7 ans et plus. Pré-commande ouverte.",
};

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const catalogue = await getPublicCatalogue();

  return (
    <SiteChrome>
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">✨ Nos séries personnalisées</h1>
        <p className="text-gray-600">
          {catalogue.length} séries disponibles · Pré-commande ouverte · tout le Cameroun
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {catalogue.map((bd) => (
          <CarteBD key={bd.id} bd={bd} />
        ))}
      </div>
      {catalogue.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-white p-6 text-center text-gray-600">
          Les séries seront bientôt disponibles.
        </div>
      )}

      {/* Infos livraison */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "📱", titre: "Commande sur WhatsApp", texte: "Envoyez votre commande en 2 clics, nous confirmons par WhatsApp." },
          { icon: "🚀", titre: "Expédition en 48h", texte: "Après confirmation, votre BD personnalisée est expédiée partout au Cameroun." },
          { icon: "📦", titre: "1 000 FCFA frais d'expédition", texte: "Frais d'expédition payés par Mobile Money avant expédition, aucun paiement caché." },
        ].map(({ icon, titre, texte }) => (
          <div key={titre} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">{icon}</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">{titre}</div>
              <div className="text-sm text-gray-700 mt-0.5">{texte}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </SiteChrome>
  );
}
