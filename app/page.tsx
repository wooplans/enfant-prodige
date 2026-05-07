import Link from "next/link";
import { catalogue, WHATSAPP_NUMBER } from "@/lib/catalogue";
import CarteBD from "@/components/CarteBC";

export default function Home() {
  const nouveautes = catalogue.filter((bd) => bd.nouveaute && bd.disponible);
  const tousDisponibles = catalogue.filter((bd) => bd.disponible);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Des Bandes Dessinées{" "}
            <span className="text-yellow-300">100% Africaines</span>
          </h1>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Découvrez des histoires captivantes créées par des auteurs camerounais et africains.
            Commandez via WhatsApp et recevez vos BD directement chez vous.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/catalogue"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-3 rounded-full text-lg transition-colors"
            >
              Voir le catalogue
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors flex items-center gap-2"
            >
              <span>📱</span> Commander sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
            Comment commander ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                titre: "Choisissez votre BD",
                texte: "Parcourez notre catalogue et trouvez la BD qui vous plaît.",
              },
              {
                icon: "📱",
                titre: "Commandez sur WhatsApp",
                texte:
                  "Cliquez sur « Commander » — un message WhatsApp pré-rempli s'ouvre automatiquement.",
              },
              {
                icon: "🚚",
                titre: "Recevez à domicile",
                texte:
                  "Nous livrons partout au Cameroun. Payez la BD + frais de livraison à la réception.",
              },
            ].map(({ icon, titre, texte }) => (
              <div key={titre} className="text-center px-4">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-800 font-bold text-2xl flex items-center justify-center mx-auto mb-3">
                  {icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{titre}</h3>
                <p className="text-sm text-gray-500">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      {nouveautes.length > 0 && (
        <section className="py-14 px-4 bg-amber-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">🆕 Nouveautés</h2>
              <Link
                href="/catalogue"
                className="text-green-700 hover:text-green-600 text-sm font-medium"
              >
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {nouveautes.map((bd) => (
                <CarteBD key={bd.id} bd={bd} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalogue aperçu */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">📖 Notre catalogue</h2>
            <Link
              href="/catalogue"
              className="text-green-700 hover:text-green-600 text-sm font-medium"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {tousDisponibles.slice(0, 4).map((bd) => (
              <CarteBD key={bd.id} bd={bd} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/catalogue"
              className="inline-block bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Voir toutes les BD
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-14 px-4 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "🇨🇲",
                titre: "100% Camerounais",
                texte: "Des auteurs locaux, des histoires qui nous ressemblent.",
              },
              {
                icon: "💳",
                titre: "Paiement à la livraison",
                texte: "Vous payez uniquement à la réception de votre commande.",
              },
              {
                icon: "🚚",
                titre: "Livraison nationale",
                texte:
                  "Nous livrons partout au Cameroun : Douala, Yaoundé et villes de province.",
              },
              {
                icon: "📱",
                titre: "Commande facile",
                texte:
                  "Commandez en 1 clic via WhatsApp, sans formulaire compliqué.",
              },
            ].map(({ icon, titre, texte }) => (
              <div key={titre} className="flex gap-4 items-start">
                <div className="text-3xl shrink-0">{icon}</div>
                <div>
                  <h3 className="font-bold text-yellow-300 mb-1">{titre}</h3>
                  <p className="text-green-200 text-sm">{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
