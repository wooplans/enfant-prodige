import { catalogue } from "@/lib/catalogue";
import CarteBD from "@/components/CarteBC";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue | Enfant Prodige BD",
  description: "Toutes nos bandes dessinées africaines disponibles à la commande au Cameroun.",
};

export default function CataloguePage() {
  const disponibles = catalogue.filter((bd) => bd.disponible);
  const indisponibles = catalogue.filter((bd) => !bd.disponible);
  const genres = [...new Set(catalogue.map((bd) => bd.genre))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">📚 Catalogue complet</h1>
        <p className="text-gray-500">
          {disponibles.length} BD disponibles · Livraison partout au Cameroun
        </p>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
          Tous genres
        </span>
        {genres.map((genre) => (
          <span
            key={genre}
            className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full hover:bg-green-100 hover:text-green-800 cursor-pointer transition-colors"
          >
            {genre}
          </span>
        ))}
      </div>

      {/* BD disponibles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {disponibles.map((bd) => (
          <CarteBD key={bd.id} bd={bd} />
        ))}
      </div>

      {/* BD indisponibles */}
      {indisponibles.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-400 mb-6">⏳ Bientôt disponible</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 opacity-60">
            {indisponibles.map((bd) => (
              <CarteBD key={bd.id} bd={bd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
