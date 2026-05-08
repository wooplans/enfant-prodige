import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/catalogue";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span>📚</span> Enfant Prodige BD
          </h3>
          <p className="text-green-100 text-sm leading-relaxed">
            Des livres illustrés personnalisés pour les enfants africains de 6 à 10 ans. Le prénom
            de votre enfant sur la couverture et dans les dialogues. Livraison sous 24h à Yaoundé
            et Douala.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm text-green-100">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/catalogue" className="hover:text-white transition-colors">
                Nos séries
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">Commander</h3>
          <p className="text-green-100 text-sm mb-3">
            Commandez via WhatsApp. Payez par Mobile Money après confirmation. Livraison en 24h.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-full text-sm transition-colors"
          >
            📱 Nous contacter
          </a>
        </div>
      </div>

      <div className="border-t border-green-700 text-center py-4 text-green-200 text-sm">
        © {new Date().getFullYear()} Enfant Prodige BD — Cameroun 🇨🇲
      </div>
    </footer>
  );
}
