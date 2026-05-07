import Link from "next/link";
import { catalogue, WHATSAPP_NUMBER } from "@/lib/catalogue";
import CarteBD from "@/components/CarteBC";

export default function Home() {
  return (
    <>
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
            illustrées, livrées en 24h à Yaoundé et Douala.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/catalogue"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-3 rounded-full text-lg transition-colors"
            >
              Choisir une série
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

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
            Comment commander ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "✨",
                titre: "Choisissez une série",
                texte: "Parcourez nos 3 séries et trouvez celle qui convient à votre enfant (6–10 ans).",
              },
              {
                icon: "📱",
                titre: "Entrez le prénom et commandez",
                texte: "Tapez le prénom de l'enfant, choisissez votre adresse, puis envoyez sur WhatsApp. Payez 9 900 FCFA par Mobile Money.",
              },
              {
                icon: "🚀",
                titre: "Reçu en 24h après paiement",
                texte: "Votre BD personnalisée est livrée chez vous sous 24h. Payez 1 000 FCFA au livreur à la réception.",
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

      {/* ── NOS SÉRIES ── */}
      <section className="py-14 px-4 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">✨ Nos 3 séries personnalisées</h2>
            <Link href="/catalogue" className="text-green-700 hover:text-green-600 text-sm font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {catalogue.map((bd) => (
              <CarteBD key={bd.id} bd={bd} />
            ))}
          </div>
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
                icon: "💳",
                titre: "Mobile Money sécurisé",
                texte: "Payez simplement par MTN MoMo ou Orange Money après confirmation de votre commande.",
              },
              {
                icon: "🚀",
                titre: "Livraison en 24h",
                texte: "Après paiement, votre BD personnalisée est imprimée et livrée sous 24h à Yaoundé et Douala.",
              },
              {
                icon: "📱",
                titre: "Commande facile",
                texte: "Commandez en quelques clics via WhatsApp, sans formulaire compliqué.",
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
