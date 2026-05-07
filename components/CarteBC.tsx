import Link from "next/link";
import { BD, buildWhatsAppMessage } from "@/lib/catalogue";

interface CarteBDProps {
  bd: BD;
}

export default function CarteBD({ bd }: CarteBDProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col border border-amber-100">
      {/* Couverture */}
      <Link href={`/bd/${bd.id}`} className="relative block bg-amber-100 aspect-[2/3] overflow-hidden group">
        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-amber-200 to-orange-300 group-hover:scale-105 transition-transform duration-300">
          📖
        </div>
        {bd.nouveaute && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NOUVEAUTÉ
          </span>
        )}
        {!bd.disponible && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </Link>

      {/* Infos */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-green-700 font-medium uppercase tracking-wide mb-1">
          {bd.genre}
        </span>
        <Link href={`/bd/${bd.id}`}>
          <h3 className="font-bold text-gray-900 hover:text-green-700 transition-colors leading-tight">
            {bd.titre}
            {bd.tome && <span className="font-normal text-gray-500"> — Tome {bd.tome}</span>}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-0.5">✍️ {bd.auteur}</p>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{bd.description}</p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <div className="text-xl font-bold text-green-800">
              {bd.prix.toLocaleString("fr-FR")} FCFA
            </div>
            <div className="text-xs text-gray-400">
              + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA livraison
            </div>
          </div>

          {bd.disponible ? (
            <a
              href={buildWhatsAppMessage(bd)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>📱</span> Commander
            </a>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-500 text-sm px-4 py-2 rounded-xl cursor-not-allowed"
            >
              Indisponible
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
