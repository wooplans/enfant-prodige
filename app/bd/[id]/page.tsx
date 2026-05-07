"use client";

import { catalogue } from "@/lib/catalogue";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, use } from "react";
import CommanderForm from "@/components/CommanderForm";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import CheckoutModal from "@/components/CheckoutModal";
import DescriptionExpandable from "@/components/DescriptionExpandable";
import FaqAccordion from "@/components/FaqAccordion";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PageBD({ params }: Props) {
  const { id } = use(params);
  const bd = catalogue.find((b) => b.id === id);
  if (!bd) notFound();

  const [modalOuvert, setModalOuvert] = useState(false);

  const autresSeries = catalogue.filter((b) => b.id !== bd.id);

  return (
    <>
      {/* ── HERO COVER ── */}
      <div className="relative bg-gradient-to-b from-green-900 to-green-700 pt-4 pb-0">
        <div className="flex items-center px-4 mb-4">
          <Link
            href="/catalogue"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Nos séries
          </Link>
          <span className="ml-auto bg-yellow-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full">
            {bd.ageMin}–{bd.ageMax} ans
          </span>
        </div>

        <div className="flex justify-center px-8">
          <div className="relative w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-200 to-orange-400 flex items-center justify-center">
            <span className="text-8xl">📖</span>
          </div>
        </div>

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

          {/* Titre */}
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{bd.serie}</h1>
          <p className="text-sm text-gray-500 mt-1 mb-3">📚 {bd.nombrePages} pages · Illustré pleine couleur · Format A4</p>

          {/* Badge personnalisation */}
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 mb-3">
            <span className="text-base">✨</span>
            <p className="text-xs font-semibold text-purple-700">
              BD personnalisée — Le prénom de votre enfant sur la couverture et dans les dialogues
            </p>
          </div>

          {/* Preuve sociale */}
          {bd.nombreCommandesSemaine > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mb-5">
              <span className="text-base">🔥</span>
              <p className="text-xs font-semibold text-orange-700">
                {bd.nombreCommandesSemaine} familles ont commandé cette série cette semaine
              </p>
            </div>
          )}

          {/* ── PRIX + CTA ── */}
          <CommanderForm
            prix={bd.prix}
            fraisLivraison={bd.fraisLivraison}
            onCommander={() => setModalOuvert(true)}
          />

          {/* ── BADGES RÉASSURANCE ── */}
          <div className="grid grid-cols-3 gap-2 my-5">
            {[
              { icon: "📱", label: "Commande via WhatsApp" },
              { icon: "💳", label: "Paiement Mobile Money" },
              { icon: "🚀", label: "Livraison en 24h" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-gray-600 font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>

          {/* ── DESCRIPTION ── */}
          <Section titre="📖 À propos de cette série">
            <DescriptionExpandable texte={bd.descriptionLongue} />
          </Section>

          {/* ── POUR QUI ── */}
          <Section titre="🎯 Cette BD vous plaira si…">
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
                {
                  step: "1",
                  titre: "Entrez le prénom de l'enfant",
                  texte: "Cliquez sur « Commander cette BD » et renseignez le prénom et le sexe de l'enfant. Il apparaîtra sur la couverture.",
                },
                {
                  step: "2",
                  titre: "Indiquez votre adresse",
                  texte: "Renseignez votre quartier pour que le livreur vous trouve facilement.",
                },
                {
                  step: "3",
                  titre: "Envoyez sur WhatsApp et payez",
                  texte: "Un message pré-rempli s'ouvre. Envoyez-le et payez 9 900 FCFA par Mobile Money après confirmation.",
                },
                {
                  step: "4",
                  titre: "Recevez votre BD sous 24h",
                  texte: "Nous personnalisons et livrons votre BD. Vous payez 1 000 FCFA au livreur à la réception.",
                },
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
            <Section titre={`⭐ Avis parents · ${bd.note}/5`}>
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
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
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

          {/* ── AUTRES SÉRIES ── */}
          {autresSeries.length > 0 && (
            <Section titre="📚 Découvrir nos autres séries">
              <div className="grid grid-cols-2 gap-3">
                {autresSeries.map((autre) => (
                  <Link
                    key={autre.id}
                    href={`/bd/${autre.id}`}
                    className="bg-white rounded-xl border border-gray-100 p-3 hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="aspect-[2/3] bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center text-4xl mb-2">
                      📖
                    </div>
                    <div className="font-semibold text-sm text-gray-800 leading-tight">{autre.serie}</div>
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
          <div className="bg-green-800 rounded-2xl p-6 text-center text-white mt-6">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-extrabold text-xl mb-1">Offrez-lui son livre à lui</h3>
            <p className="text-green-200 text-sm mb-4">
              Personnalisé avec son prénom · Livré en 24h · Mobile Money
            </p>
            <button
              onClick={() => setModalOuvert(true)}
              className="inline-flex items-center gap-2 bg-white text-green-800 font-extrabold px-8 py-4 rounded-2xl text-base hover:bg-green-50 transition-colors shadow-lg w-full justify-center"
            >
              <span>✨</span> Commander maintenant
            </button>
            <p className="text-green-400 text-xs mt-2">
              {bd.prix.toLocaleString("fr-FR")} FCFA + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA livraison
            </p>
          </div>
        </div>
      </div>

      {/* Barre sticky */}
      <StickyCommanderBar prix={bd.prix} onCommander={() => setModalOuvert(true)} />

      {/* Modal checkout */}
      {modalOuvert && <CheckoutModal bd={bd} onClose={() => setModalOuvert(false)} />}
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
        <span
          key={i}
          className={
            i < full ? "text-yellow-400" : half && i === full ? "text-yellow-300" : "text-gray-200"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}
