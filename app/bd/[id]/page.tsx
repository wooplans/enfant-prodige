import { catalogue, buildWhatsAppMessage } from "@/lib/catalogue";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import DescriptionExpandable from "@/components/DescriptionExpandable";
import FaqAccordion from "@/components/FaqAccordion";

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

  const whatsappUrl = buildWhatsAppMessage(bd);
  const autresTomes = catalogue.filter(
    (b) => b.titre === bd.titre && b.auteur === bd.auteur && b.id !== bd.id
  );

  return (
    <>
      {/* ── HERO COVER ── */}
      <div className="relative bg-gradient-to-b from-green-900 to-green-700 pt-4 pb-0">
        {/* Barre retour */}
        <div className="flex items-center px-4 mb-4">
          <Link
            href="/catalogue"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Catalogue
          </Link>
          {bd.nouveaute && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              NOUVEAUTÉ
            </span>
          )}
        </div>

        {/* Couverture centrée */}
        <div className="flex justify-center px-8">
          <div className="relative w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center">
            <span className="text-8xl">📖</span>
            {!bd.disponible && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
                  Rupture de stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Courbe de transition */}
        <div className="h-8 bg-amber-50 rounded-t-3xl mt-6" />
      </div>

      {/* ── CONTENU ── */}
      <div className="bg-amber-50 pb-28">
        <div className="max-w-2xl mx-auto px-4">

          {/* Genre + Note */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider bg-green-100 px-2.5 py-1 rounded-full">
              {bd.genre}
            </span>
            {bd.nombreAvis > 0 && (
              <div className="flex items-center gap-1">
                <Stars note={bd.note} />
                <span className="text-sm text-gray-500 font-medium">
                  {bd.note} ({bd.nombreAvis} avis)
                </span>
              </div>
            )}
          </div>

          {/* Titre + Auteur */}
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {bd.titre}
            {bd.tome && <span className="text-gray-400 font-normal"> — Tome {bd.tome}</span>}
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-3">✍️ par <span className="font-medium text-gray-700">{bd.auteur}</span></p>

          {/* Preuve sociale */}
          {bd.nombreCommandesSemaine > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-5">
              <span className="text-base">🔥</span>
              <p className="text-xs font-semibold text-orange-700">
                {bd.nombreCommandesSemaine} personnes ont commandé cette BD cette semaine
              </p>
            </div>
          )}

          {/* ── PRIX + CTA PRINCIPAL ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="flex items-end justify-between mb-1">
              <div>
                <span className="text-3xl font-extrabold text-green-800">
                  {bd.prix.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              {bd.disponible && (
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                  En stock
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4">
              + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA frais de livraison
              <span className="text-green-600 font-medium"> · payés à la livraison</span>
            </p>

            {bd.disponible ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                <WhatsAppIcon size="lg" />
                Commander via WhatsApp
              </a>
            ) : (
              <button disabled className="w-full bg-gray-200 text-gray-400 font-bold text-lg py-4 rounded-2xl cursor-not-allowed">
                Rupture de stock
              </button>
            )}
            <p className="text-xs text-gray-400 text-center mt-2">
              Un message pré-rempli s'ouvre automatiquement — réponse en quelques minutes
            </p>
          </div>

          {/* ── BADGES DE RÉASSURANCE ── */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: "🚚", label: "Livraison partout au Cameroun" },
              { icon: "💳", label: "Paiement à la livraison" },
              { icon: "✅", label: "Qualité garantie" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-gray-600 font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>

          {/* ── DESCRIPTION ── */}
          <Section titre="📖 À propos de cette BD">
            <DescriptionExpandable texte={bd.descriptionLongue} />
          </Section>

          {/* ── POUR QUI ── */}
          <Section titre="🎯 Ce livre vous plaira si…">
            <ul className="space-y-2">
              {bd.pourQui.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* ── COMMENT COMMANDER ── */}
          <Section titre="📱 Comment commander ?">
            <div className="space-y-4">
              {[
                { step: "1", titre: "Cliquez sur « Commander via WhatsApp »", texte: "Le bouton ouvre WhatsApp avec un message déjà rédigé pour vous." },
                { step: "2", titre: "Envoyez le message et confirmez", texte: "Notre équipe vous répond rapidement pour valider votre commande et votre adresse." },
                { step: "3", titre: "Recevez et payez à la livraison", texte: "Le livreur vous remet la BD. Vous payez seulement à ce moment-là." },
              ].map(({ step, titre, texte }) => (
                <div key={step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{titre}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{texte}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── AVIS CLIENTS ── */}
          {bd.avis.length > 0 && (
            <Section titre={`⭐ Avis clients · ${bd.note}/5`}>
              <div className="flex items-center gap-3 mb-4 bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-green-800">{bd.note}</div>
                  <Stars note={bd.note} />
                  <div className="text-xs text-gray-400 mt-0.5">{bd.nombreAvis} avis</div>
                </div>
                <div className="flex-1 space-y-1.5 pl-2">
                  {[5, 4, 3].map((n) => {
                    const count = bd.avis.filter((a) => a.note === n).length;
                    const pct = bd.avis.length > 0 ? Math.round((count / bd.avis.length) * 100) : 0;
                    return (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-2">{n}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-6">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {bd.avis.map((avis, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {avis.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{avis.nom}</div>
                        <div className="text-xs text-gray-400">{avis.ville} · {avis.date}</div>
                      </div>
                      <Stars note={avis.note} small />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">"{avis.commentaire}"</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── FAQ ── */}
          <Section titre="❓ Questions fréquentes">
            <FaqAccordion />
          </Section>

          {/* ── AUTRES TOMES ── */}
          {autresTomes.length > 0 && (
            <Section titre="📚 Autres tomes de la série">
              <div className="grid grid-cols-2 gap-3">
                {autresTomes.map((autre) => (
                  <Link
                    key={autre.id}
                    href={`/bd/${autre.id}`}
                    className="bg-white rounded-xl border border-gray-100 p-3 hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="aspect-[2/3] bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center text-4xl mb-2">
                      📖
                    </div>
                    <div className="font-semibold text-sm text-gray-800">Tome {autre.tome}</div>
                    <Stars note={autre.note} small />
                    <div className="text-green-700 font-bold text-sm mt-0.5">
                      {autre.prix.toLocaleString("fr-FR")} FCFA
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* ── CTA FINAL ── */}
          {bd.disponible && (
            <div className="bg-green-800 rounded-2xl p-6 text-center text-white mt-6">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-extrabold text-xl mb-1">Prêt(e) à commander ?</h3>
              <p className="text-green-200 text-sm mb-4">
                Livraison partout au Cameroun · Paiement à la livraison
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-800 font-extrabold px-8 py-4 rounded-2xl text-base hover:bg-green-50 transition-colors shadow-lg w-full justify-center"
              >
                <WhatsAppIcon size="md" color="green" />
                Commander maintenant
              </a>
              <p className="text-green-400 text-xs mt-2">
                {bd.prix.toLocaleString("fr-FR")} FCFA + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA livraison
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Barre sticky bas */}
      <StickyCommanderBar prix={bd.prix} whatsappUrl={whatsappUrl} disponible={bd.disponible} />
    </>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-extrabold text-gray-900 text-base mb-3">{titre}</h2>
      {children}
    </div>
  );
}

function Stars({ note, small }: { note: number; small?: boolean }) {
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  return (
    <div className={`flex items-center gap-0.5 ${small ? "text-xs" : "text-sm"}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "text-yellow-400" : half && i === full ? "text-yellow-300" : "text-gray-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

function WhatsAppIcon({ size = "md", color = "white" }: { size?: "md" | "lg"; color?: "white" | "green" }) {
  const cls = size === "lg" ? "w-6 h-6" : "w-5 h-5";
  const fill = color === "green" ? "#16a34a" : "currentColor";
  return (
    <svg viewBox="0 0 24 24" fill={fill} className={cls}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
