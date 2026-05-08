"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import CheckoutModal from "@/components/CheckoutModal";
import FaqAccordion from "@/components/FaqAccordion";
import { fbqTrack } from "@/components/FacebookPixel";

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

  useEffect(() => {
    fbqTrack("ViewContent", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
  }, [bd.id, bd.prix, bd.serie]);

  const synopsisTexte =
    bd.id === "apprentis-explorateurs"
      ? "Votre enfant est invité à rejoindre l'équipe des Apprentis Explorateurs pour une expédition à travers les plus beaux paysages d'Afrique : la savane du Cameroun, les chutes de la Lobé, le lac Tchad et bien plus encore. Guidé par ses compagnons, il découvre la géographie, les animaux et les cultures de son continent."
      : bd.descriptionLongue;
  const ratingBreakdown = getRatingBreakdown(bd.note, bd.nombreAvis);

  return (
    <>
      {/* HERO */}
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
            <div className="max-w-2xl lg:col-start-1 lg:row-start-1">
              <h1 className="text-3xl md:text-6xl font-extrabold leading-tight tracking-normal">{bd.serie}</h1>
              <div className="mt-4">
                {bd.nombreAvis > 0 && (
                  <div className="inline-flex items-center gap-2 bg-yellow-50 text-green-950 rounded-full px-4 py-2 shadow-lg border border-yellow-200">
                    <Stars note={bd.note} />
                    <span className="text-sm font-extrabold text-green-900">{bd.note}/5</span>
                    <span className="text-sm font-semibold text-green-700">({bd.nombreAvis} avis)</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-base md:text-lg text-green-50 leading-relaxed">{bd.description}</p>
            </div>

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
                    className={`object-cover transition-opacity duration-500 ${slideActif === index ? "opacity-100" : "opacity-0"}`}
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
                          className={`h-2 rounded-full transition-all ${slideActif === index ? "w-8 bg-yellow-300" : "w-2 bg-white/50 hover:bg-white"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <main className="bg-white pb-28">
        <FullWidthSection title="À propos de cette série" tone="white">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
            <p className="max-w-3xl text-base leading-8 text-gray-700 md:text-lg md:leading-9">{synopsisTexte}</p>
            <div className="border-t border-green-200 pt-5 text-center md:border-l md:border-t-0 md:pl-7 md:pt-0">
              <div className="text-sm font-bold text-gray-400 line-through">15 000 FCFA</div>
              <div className="mt-1 text-3xl font-extrabold leading-none text-green-900">
                {bd.prix.toLocaleString("fr-FR")} FCFA
              </div>
              <button
                onClick={() => setModalOuvert(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 text-base font-bold text-white transition-colors duration-200 hover:bg-green-600 active:bg-green-800"
              >
                Personnaliser maintenant <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection title="Comment commander ?" tone="warm" wide>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "1",
                titre: "Entrez le prénom de l'enfant",
                texte: "Cliquez sur « Commander cette BD » et renseignez le prénom et le sexe de l'enfant. Il apparaîtra sur la couverture.",
              },
              {
                step: "2",
                titre: "Envoyez sur WhatsApp et payez",
                texte: "Un message pré-rempli s'ouvre. Envoyez-le et payez 9 900 FCFA par Mobile Money après confirmation.",
              },
              {
                step: "3",
                titre: "Recevez votre BD sous 24h",
                texte: "Nous personnalisons et livrons votre BD. Vous payez 1 000 FCFA au livreur à la réception.",
              },
            ].map(({ step, titre, texte }) => (
              <li key={step} className="relative border-t border-amber-200 pt-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-sm font-extrabold text-white">
                  {step}
                </div>
                <h3 className="text-base font-extrabold leading-snug text-gray-950">{titre}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{texte}</p>
              </li>
            ))}
          </ol>
        </FullWidthSection>

        {bd.avis.length > 0 && (
          <div id="avis-parents">
            <FullWidthSection title={`Avis parents · ${bd.note}/5`} tone="white" wide>
              <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
                <div className="border-b border-green-100 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                  <div className="text-6xl font-extrabold leading-none text-green-900">{bd.note}</div>
                  <div className="mt-3">
                    <Stars note={bd.note} />
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-600">{bd.nombreAvis} avis parents</div>
                  <div className="mt-5 space-y-2">
                    {ratingBreakdown.map(({ count, note, pct }) => {
                      return (
                        <div key={note} className="flex items-center gap-2">
                          <span className="w-3 text-sm font-semibold text-gray-600">{note}</span>
                          <div className="h-2 flex-1 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-12 text-right text-sm font-medium text-gray-600">{count} avis</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="divide-y divide-green-100">
                  {bd.avis.map((avis, i) => (
                    <article key={i} className={i === 0 ? "pb-6" : "py-6"}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-extrabold text-gray-950">{avis.nom}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span>{avis.ville} · {avis.date}</span>
                            <span className="font-bold text-green-700">Achat vérifié</span>
                          </div>
                        </div>
                        <Stars note={avis.note} small />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-gray-700">« {avis.commentaire} »</p>
                    </article>
                  ))}
                </div>
              </div>
            </FullWidthSection>
          </div>
        )}

        <FullWidthSection title="Questions fréquentes" tone="warm">
          <FaqAccordion />
        </FullWidthSection>

        {autresSeries.length > 0 && (
          <FullWidthSection title="Découvrir nos autres séries" tone="white" wide>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {autresSeries.map((autre) => (
                <Link
                  key={autre.id}
                  href={`/bd/${autre.id}`}
                  className="group grid grid-cols-[112px_minmax(0,1fr)] gap-4 transition-colors duration-200 sm:block"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-amber-100 sm:mb-4">
                    <Image
                      src={autre.couverture}
                      alt={`Couverture de ${autre.serie}`}
                      fill
                      sizes="(min-width: 768px) 300px, 112px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="self-center">
                    <div className="text-lg font-extrabold leading-tight text-gray-950 transition-colors duration-200 group-hover:text-green-800">
                      {autre.serie}
                    </div>
                    <div className="mt-2">
                      <Stars note={autre.note} small />
                    </div>
                    <div className="mt-2 text-sm font-extrabold text-green-700">{autre.prix.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </Link>
              ))}
            </div>
          </FullWidthSection>
        )}

        <FullWidthSection title="C'est à vous de réveillez l'imagination de votre enfant." tone="dark">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base leading-7 text-green-100">Faites de votre enfant le héros de sa propre histoire !</p>
            <button
              onClick={() => setModalOuvert(true)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-extrabold text-green-900 transition-colors duration-200 hover:bg-green-50 sm:w-auto"
            >
              Personnalisez pour mon enfant <span aria-hidden="true">→</span>
            </button>
          </div>
        </FullWidthSection>

        <FullWidthSection title="Cette BD vous plaira si…" tone="green">
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {bd.pourQui.map((item) => (
              <li key={item} className="flex items-start gap-3 border-t border-green-200 pt-4 text-sm leading-7 text-gray-700">
                <span className="mt-0.5 shrink-0 font-bold text-green-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FullWidthSection>

        <div className="bg-white px-4 py-8">
          <div className="mx-auto grid max-w-4xl gap-4 border-y border-amber-200 py-5 text-center sm:grid-cols-3">
            {[
              { icon: "📱", label: "Commande via WhatsApp" },
              { icon: "💳", label: "Paiement Mobile Money" },
              { icon: "🚀", label: "Livraison en 24h" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700">
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <StickyCommanderBar onCommander={() => setModalOuvert(true)} shakeStartId="avis-parents" />
      {modalOuvert && <CheckoutModal bd={bd} onClose={() => setModalOuvert(false)} />}
    </>
  );
}

type SectionTone = "white" | "warm" | "green" | "dark";

const sectionTones: Record<SectionTone, string> = {
  white: "bg-white text-gray-950",
  warm: "bg-amber-50 text-gray-950",
  green: "bg-green-50 text-gray-950",
  dark: "bg-green-900 text-white",
};

function FullWidthSection({
  title,
  children,
  tone = "white",
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  tone?: SectionTone;
  wide?: boolean;
}) {
  const isDark = tone === "dark";

  return (
    <section className={`${sectionTones[tone]} px-4 py-12 md:py-16 ${isDark ? "md:py-20" : ""}`}>
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        <div className="mb-8 md:mb-10">
          <div className={`mb-4 h-1 w-14 ${isDark ? "bg-yellow-300" : "bg-green-700"}`} />
          <h2 className={`text-2xl font-extrabold leading-tight md:text-3xl ${isDark ? "text-white" : "text-gray-950"}`}>
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function getRatingBreakdown(note: number, total: number) {
  const levels = [5, 4, 3];
  const safeTotal = Math.max(0, total);

  if (safeTotal === 0) {
    return levels.map((level) => ({ note: level, count: 0, pct: 0 }));
  }

  let bestCounts = [safeTotal, 0, 0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (let fiveStars = 0; fiveStars <= safeTotal; fiveStars += 1) {
    for (let fourStars = 0; fourStars <= safeTotal - fiveStars; fourStars += 1) {
      const threeStars = safeTotal - fiveStars - fourStars;
      const average = (fiveStars * 5 + fourStars * 4 + threeStars * 3) / safeTotal;
      const score = Math.abs(average - note);

      if (score < bestScore) {
        bestScore = score;
        bestCounts = [fiveStars, fourStars, threeStars];
      }
    }
  }

  return levels.map((level, index) => {
    const count = bestCounts[index];
    return {
      note: level,
      count,
      pct: Math.round((count / safeTotal) * 100),
    };
  });
}

function Stars({ note, small }: { note: number; small?: boolean }) {
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  return (
    <div className={`flex items-center gap-0.5 ${small ? "text-sm" : "text-base"}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < full ? "text-yellow-400" : half && i === full ? "text-yellow-300" : "text-gray-200"}
        >
          ★
        </span>
      ))}
    </div>
  );
}
