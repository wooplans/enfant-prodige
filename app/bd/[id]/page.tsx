import { catalogue, buildWhatsAppMessage } from "@/lib/catalogue";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bd = catalogue.find((b) => b.id === id);
  if (!bd) return { title: "BD non trouvée" };
  return {
    title: `${bd.titre}${bd.tome ? ` — Tome ${bd.tome}` : ""} | Enfant Prodige BD`,
    description: bd.description,
  };
}

export function generateStaticParams() {
  return catalogue.map((bd) => ({ id: bd.id }));
}

export default async function PageBD({ params }: Props) {
  const { id } = await params;
  const bd = catalogue.find((b) => b.id === id);
  if (!bd) notFound();

  const serieComplete = catalogue.filter((b) => b.titre === bd.titre && b.auteur === bd.auteur);
  const autresTomes = serieComplete.filter((b) => b.id !== bd.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-green-700">Accueil</Link>
        <span>›</span>
        <Link href="/catalogue" className="hover:text-green-700">Catalogue</Link>
        <span>›</span>
        <span className="text-gray-600">{bd.titre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Couverture */}
        <div className="relative">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center shadow-xl">
            <span className="text-8xl">📖</span>
          </div>
          {bd.nouveaute && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
              NOUVEAUTÉ
            </span>
          )}
          {!bd.disponible && (
            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-full font-semibold">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-green-700 uppercase tracking-wide mb-2">
            {bd.genre}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {bd.titre}
            {bd.tome && (
              <span className="text-gray-400 font-normal ml-2">— Tome {bd.tome}</span>
            )}
          </h1>
          <p className="text-gray-500 mt-1 mb-4">✍️ {bd.auteur}</p>

          <p className="text-gray-700 leading-relaxed mb-6">{bd.description}</p>

          {/* Prix */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-green-800">
                {bd.prix.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA de frais de livraison
              <span className="ml-1 text-green-600 font-medium">(payés à la livraison)</span>
            </p>
          </div>

          {/* Bouton Commander */}
          {bd.disponible ? (
            <a
              href={buildWhatsAppMessage(bd)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl mb-3"
            >
              <WhatsAppIcon />
              Commander via WhatsApp
            </a>
          ) : (
            <button
              disabled
              className="bg-gray-200 text-gray-400 font-bold text-lg px-8 py-4 rounded-2xl cursor-not-allowed mb-3"
            >
              Rupture de stock
            </button>
          )}

          <p className="text-xs text-gray-400 text-center mb-6">
            Un message WhatsApp pré-rempli s'ouvrira automatiquement.
          </p>

          {/* Infos livraison */}
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 text-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl">🚚</span>
              <div>
                <div className="font-medium text-gray-800">Livraison partout au Cameroun</div>
                <div className="text-gray-500">Douala, Yaoundé, et toutes les provinces</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl">💳</span>
              <div>
                <div className="font-medium text-gray-800">Paiement à la livraison</div>
                <div className="text-gray-500">
                  BD payée à la réception + frais de livraison
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Autres tomes de la série */}
      {autresTomes.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            📚 Autres tomes de la série
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {autresTomes.map((autre) => (
              <Link
                key={autre.id}
                href={`/bd/${autre.id}`}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center text-4xl mb-3">
                  📖
                </div>
                <div className="font-semibold text-sm text-gray-800">Tome {autre.tome}</div>
                <div className="text-green-700 font-bold text-sm">
                  {autre.prix.toLocaleString("fr-FR")} FCFA
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Retour catalogue */}
      <div className="mt-12 text-center">
        <Link
          href="/catalogue"
          className="text-green-700 hover:text-green-600 font-medium text-sm"
        >
          ← Retour au catalogue
        </Link>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
