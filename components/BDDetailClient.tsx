"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BD } from "@/lib/catalogue";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import CheckoutModal from "@/components/CheckoutModal";
import DescriptionExpandable from "@/components/DescriptionExpandable";
import FaqAccordion from "@/components/FaqAccordion";

interface Props {
  bd: BD;
  autresSeries: BD[];
}

export default function BDDetailClient({ bd, autresSeries }: Props) {
  const [modalOuvert, setModalOuvert] = useState(false);
  const [slideActif, setSlideActif] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const slides = bd.galerie.slice(0, 4);
  const slideLabels = ["Couverture", "Aperçu histoire", "Héros", "Détails"];
  const slideSuivant = () => setSlideActif((current) => (current + 1) % slides.length);
  const slidePrecedent = () => setSlideActif((current) => (current - 1 + slides.length) % slides.length);
  const handleSwipeEnd = (x: number) => {
    if (touchStartX === null) return;

    const delta = touchStartX - x;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        slideSuivant();
      } else {
        slidePrecedent();
      }
    }
    setTouchStartX(null);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.2),transparent_28%),linear-gradient(135deg,rgba(22,101,52,0.95),rgba(6,78,59,0.98))]" />
        <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-12">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Nos séries
          </Link>

          <div className="grid lg:grid-cols-[1fr_480px] gap-6 lg:gap-12 items-center">
            <div className="w-auto -mx-4 lg:mx-0 lg:w-full lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <div
                className="relative w-full h-72 sm:h-[420px] lg:h-auto lg:aspect-[4/5] overflow-hidden bg-green-950 shadow-2xl border-y border-white/15 lg:rounded-2xl lg:border"
                style={{ minHeight: "18rem" }}
                onTouchStart={(event) => setTouchStartX(event.changedTouches[0].clientX)}
                onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].clientX)}
              >
                {slides.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`${slideLabels[index]} de ${bd.serie}`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className={`object-cover transition-opacity duration-500 ${
                      slideActif === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <button
                  onClick={slidePrecedent}
                  aria-label="Image précédente"
                  className="absolute left-3 top-1/2 z-10 w-11 h-11 -translate-y-1/2 rounded-full bg-black/35 hover:bg-black/50 border border-white/30 text-white flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  ←
                </button>
                <button
                  onClick={slideSuivant}
                  aria-label="Image suivante"
                  className="absolute right-3 top-1/2 z-10 w-11 h-11 -translate-y-1/2 rounded-full bg-black/35 hover:bg-black/50 border border-white/30 text-white flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  →
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-sm font-bold">{slideLabels[slideActif]}</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {slides.map((src, index) => (
                        <button
                          key={src}
                          onClick={() => setSlideActif(index)}
                          aria-label={`Voir l'image ${index + 1}`}
                          className={`h-2 rounded-full transition-all ${
                            slideActif === index ? "w-8 bg-yellow-300" : "w-2 bg-white/50 hover:bg-white"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-2xl lg:col-start-1 lg:row-start-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-yellow-400 text-green-950 text-xs font-extrabold px-3 py-1 rounded-full">
                  {bd.ageMin}–{bd.ageMax} ans
                </span>
                <span className="bg-white/10 border border-white/15 text-green-50 text-xs font-semibold px-3 py-1 rounded-full">
                  {bd.nombrePages} pages · Format A4
                </span>
              </div>

              <h1 className="text-3xl md:text-6xl font-extrabold leading-tight tracking-normal">
                {bd.serie}
              </h1>
              <p className="mt-4 text-base md:text-lg text-green-50 leading-relaxed">
                {bd.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {bd.nombreAvis > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 text-green-950 rounded-full px-4 py-2 shadow-lg border border-yellow-200">
                    <Stars note={bd.note} />
                    <span className="text-sm font-extrabold text-green-900">{bd.note}/5</span>
                    <span className="text-sm font-semibold text-green-700">({bd.nombreAvis} avis)</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CONTENU ── */}
      <div className="bg-amber-50 pb-28 pt-6">
        <div className="max-w-2xl mx-auto px-4">

          {/* ── BADGES RÉASSURANCE ── */}
          <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2 my-5">
            {[
              { icon: "📱", label: "Commande via WhatsApp" },
              { icon: "💳", label: "Paiement Mobile Money" },
              { icon: "🚀", label: "Livraison en 24h" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-gray-600 font-medium leading-tight break-words">{label}</div>
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
                    <p className="text-sm text-gray-600 leading-relaxed">« {avis.commentaire} »</p>
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
                    <div className="relative aspect-[2/3] bg-amber-100 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={autre.couverture}
                        alt={`Couverture de ${autre.serie}`}
                        fill
                        sizes="(min-width: 768px) 300px, 50vw"
                        className="object-cover"
                      />
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
              <span>✨</span> Personnalisez pour mon enfant
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
