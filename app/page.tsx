import Link from "next/link";
import { getPublicCatalogue } from "@/lib/series";
import CarteBD from "@/components/CarteBC";
import SiteChrome from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalogue = await getPublicCatalogue();

  return (
    <SiteChrome>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            La BD personnalisée avec{" "}
            <span className="text-yellow-300">le prénom de votre enfant</span>
          </h1>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Votre enfant devient le héros de sa propre bande dessinée africaine. 32 pages
            illustrées, expédiées en 48h partout au Cameroun.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/catalogue"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-3 rounded-full text-lg transition-colors"
            >
              Choisir une série
            </Link>
            <Link
              href="/bd/academie-genies"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors flex items-center gap-2"
            >
              <span>📘</span> Voir l&apos;exemple personnalisé
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT COMMANDER ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
            Comment commander ?
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            Simple, rapide — directement sur WhatsApp
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "✨",
                titre: "Choisissez une série",
                texte: "Parcourez nos séries et trouvez celle qui convient à votre enfant (7 ans et plus).",
              },
              {
                icon: "📝",
                titre: "Entrez le prénom et la livraison",
                texte: "Tapez le prénom de l'enfant et votre quartier. Un résumé de commande s'affiche avant envoi.",
              },
              {
                icon: "📱",
                titre: "Envoyez sur WhatsApp",
                texte: "Cliquez sur « Envoyer ma commande ». Nous vous confirmons la livraison et le paiement par WhatsApp sous peu.",
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
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 px-5 py-2.5 text-sm font-semibold text-green-800">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.845L.057 23.885a.5.5 0 0 0 .609.63l6.208-1.624A11.95 11.95 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.356-.213-3.705.969.993-3.617-.235-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
              </svg>
              Commande &amp; paiement offline — zéro friction
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS SÉRIES ── */}
      <section className="py-14 px-4 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">✨ Nos séries personnalisées</h2>
            <Link href="/catalogue" className="text-green-700 hover:text-green-600 text-sm font-medium">
              Voir tout →
            </Link>
          </div>
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
          <div className="text-center mt-10">
            <Link
              href="/catalogue"
              className="inline-block bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Voir toutes les séries
            </Link>
          </div>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section className="py-14 px-4 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Pourquoi choisir Enfant Prodige ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "✨",
                titre: "BD 100% personnalisée",
                texte: "Le prénom de votre enfant sur la couverture et dans les dialogues — un livre fait rien que pour lui.",
              },
              {
                icon: "📱",
                titre: "Commande par WhatsApp",
                texte: "Pas de paiement en ligne compliqué. Envoyez votre commande sur WhatsApp et payez à la livraison.",
              },
              {
                icon: "🚀",
                titre: "Expédition en 48h",
                texte: "Après confirmation, votre BD personnalisée est imprimée et expédiée sous 48h partout au Cameroun.",
              },
              {
                icon: "💬",
                titre: "Suivi personnalisé",
                texte: "Notre équipe vous accompagne par WhatsApp de la commande jusqu'à la livraison.",
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
    </SiteChrome>
  );
}
