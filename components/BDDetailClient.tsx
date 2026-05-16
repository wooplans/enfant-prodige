"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BD } from "@/lib/catalogue";
import type { PaymentSettings } from "@/lib/payment-settings";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import CheckoutModal from "@/components/CheckoutModal";
import FaqAccordion from "@/components/FaqAccordion";
import { fbqTrack } from "@/components/FacebookPixel";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

interface Props {
  bd: BD;
  landingPageMode?: boolean;
  paymentSettings: PaymentSettings;
  deliveryDateLabel: string;
}

type HeroSlide = {
  src: string;
  label: string;
};

function getNextHourFomoState(now: Date) {
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);

  const remainingSeconds = Math.max(0, Math.floor((nextHour.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return {
    timer: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    progress: Math.max(8, Math.round((remainingSeconds / 3600) * 100)),
  };
}

const defaultSlideLabels = ["Couverture", "Apercu histoire", "Heros", "Details"];

const personalizedHeroSlidesBySeries: Record<string, HeroSlide[]> = {
  "academie-genies": [
    {
      src: "/covers/hero-personalized/academie-genies-kylian.webp",
      label: "Kylian",
    },
    {
      src: "/covers/hero-personalized/academie-genies-william.webp",
      label: "William",
    },
    {
      src: "/covers/hero-personalized/academie-genies-paul.webp",
      label: "Paul",
    },
  ],
};

export default function BDDetailClient({ bd, landingPageMode = false, paymentSettings, deliveryDateLabel }: Props) {
  const [modalOuvert, setModalOuvert] = useState(false);
  const [slideActif, setSlideActif] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [fomoTimer, setFomoTimer] = useState("00:00:00");
  const lastCheckoutOpenAt = useRef(0);
  const slides =
    personalizedHeroSlidesBySeries[bd.id] ??
    bd.galerie.slice(0, 4).map((src, index) => ({
      src,
      label: defaultSlideLabels[index] ?? `Image ${index + 1}`,
    }));

  const trackProductEvent = (
    eventType: "cta_click" | "checkout_open" | "carousel_interaction",
    source: string,
    extra?: Record<string, string | number>
  ) => {
    trackAnalyticsEvent({
      eventType,
      metadata: {
        source,
        seriesId: bd.id,
        seriesSlug: bd.slug || bd.id,
        seriesTitle: bd.serie,
        ...extra,
      },
    });
  };

  const openCheckout = (source: string) => {
    const now = Date.now();
    if (now - lastCheckoutOpenAt.current < 500) {
      setModalOuvert(true);
      return;
    }

    lastCheckoutOpenAt.current = now;
    trackProductEvent("cta_click", source);
    trackProductEvent("checkout_open", source);
    setModalOuvert(true);
  };

  const slideSuivant = () => {
    trackProductEvent("carousel_interaction", "hero_next", { slideIndex: slideActif });
    setSlideActif((current) => (current + 1) % slides.length);
  };
  const slidePrecedent = () => {
    trackProductEvent("carousel_interaction", "hero_previous", { slideIndex: slideActif });
    setSlideActif((current) => (current - 1 + slides.length) % slides.length);
  };

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

  useEffect(() => {
    if (slides.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setSlideActif((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (bd.id !== "academie-genies") return;

    const updateTimer = () => {
      const next = getNextHourFomoState(new Date());
      setFomoTimer(next.timer);
    };
    updateTimer();

    const timerId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timerId);
  }, [bd.id]);

  const synopsisTexte =
    bd.id === "apprentis-explorateurs"
      ? "Votre enfant est invité à rejoindre l'équipe des Apprentis Explorateurs pour une expédition à travers les plus beaux paysages d'Afrique : la savane du Cameroun, les chutes de la Lobé, le lac Tchad et bien plus encore. Guidé par ses compagnons, il découvre la géographie, les animaux et les cultures de son continent."
      : bd.id === "academie-genies"
        ? "Votre garçon est invité à rejoindre l'Académie des Génies pour résoudre une grande énigme scientifique qui menace toute l'Afrique. Son prénom apparaît sur la couverture et dans les dialogues."
        : bd.descriptionLongue;
  const heroTitle = bd.id === "academie-genies" ? "Votre garçon à l'Académie des Génies" : bd.serie;
  const heroSubtitle =
    bd.id === "academie-genies"
      ? "Une bande dessinée 100% personnalisée avec le prénom de votre garçon. Imprimée en couleur, livrée chez vous."
      : bd.description;
  const primaryCtaText = bd.id === "academie-genies" ? "Personnaliser pour mon garçon" : "Personnaliser pour mon enfant";
  const academieGeniesReasons =
    bd.id === "academie-genies"
      ? [
          "Votre garçon est curieux, aime les sciences et les expériences",
          "Vous voulez l'encourager à croire en ses capacités",
          "Vous cherchez un cadeau unique, mémorable et personnalisé",
          "Vous voulez un livre où votre garçon se voit comme un héros",
        ]
      : bd.pourQui;
  const fomoRemaining = bd.id === "academie-genies" ? 13 : null;
  const fomoSold = bd.id === "academie-genies" ? 483 : null;
  const fomoTotal = fomoRemaining !== null && fomoSold !== null ? fomoRemaining + fomoSold : null;
  const fomoRemainingPct =
    fomoTotal && fomoRemaining !== null ? Math.max(3, Math.round((fomoRemaining / fomoTotal) * 100)) : 0;
  const ratingBreakdown = getRatingBreakdown(bd.note, bd.nombreAvis);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.2),transparent_28%),linear-gradient(135deg,rgba(22,101,52,0.95),rgba(6,78,59,0.98))]" />
        <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-12">
          {!landingPageMode && (
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-6"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Nos séries
            </Link>
          )}

          <div className="grid lg:grid-cols-[1fr_480px] gap-6 lg:gap-12 items-center">
            <div className="max-w-2xl lg:col-start-1 lg:row-start-1">
              <h1 className="text-3xl md:text-6xl font-extrabold leading-tight tracking-normal">{heroTitle}</h1>
              <div className="mt-4">
                {bd.nombreAvis > 0 && (
                  <div className="inline-flex items-center gap-2 bg-yellow-50 text-green-950 rounded-full px-4 py-2 shadow-lg border border-yellow-200">
                    <Stars note={bd.note} />
                    <span className="text-sm font-extrabold text-green-900">{bd.note}/5</span>
                    <span className="text-sm font-semibold text-green-700">({bd.nombreAvis} avis)</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-base md:text-lg text-green-50 leading-relaxed">{heroSubtitle}</p>
            </div>

            <div className="w-auto -mx-4 lg:mx-0 lg:w-full lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <div
                className="relative aspect-square w-full overflow-hidden bg-green-950 shadow-2xl border-y border-white/15 lg:rounded-2xl lg:border"
                style={{ minHeight: "18rem" }}
                onTouchStart={(event) => setTouchStartX(event.changedTouches[0].clientX)}
                onTouchEnd={(event) => handleSwipeEnd(event.changedTouches[0].clientX)}
              >
                {slides.map((slide, index) => (
                  <Image
                    key={slide.src}
                    src={slide.src}
                    alt={`${slide.label} de ${bd.serie}`}
                    fill
                    preload={index === 0}
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
                  <div className="text-sm font-bold">{slides[slideActif]?.label}</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {slides.map((slide, index) => (
                        <button
                          key={slide.src}
                          onClick={() => {
                            trackProductEvent("carousel_interaction", "hero_dot", {
                              slideIndex: index,
                              slideLabel: slide.label,
                            });
                            setSlideActif(index);
                          }}
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
                onClick={() => openCheckout("price_block")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 text-base font-bold text-white transition-colors duration-200 hover:bg-green-600 active:bg-green-800"
              >
                Personnaliser maintenant <span aria-hidden="true">→</span>
              </button>
              {bd.id === "academie-genies" && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left shadow-sm">
                  <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-gray-600">
                    <span>Plus que 13 exemplaires</span>
                    <span>483 vendus</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full border border-amber-200 bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-500 to-red-500 transition-all duration-700 animate-pulse"
                      style={{ width: `${fomoRemainingPct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-gray-600">
                    <span>Fin de l&apos;offre promo dans {fomoTimer}</span>
                    <span>Retour à 15 000 FCFA</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FullWidthSection>

        <FullWidthSection title="Sa BD personnalisée en 3 étapes simples" tone="warm" wide>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "1",
                titre: "Entrez le prénom de l'enfant",
                texte: "Cliquez sur « Personnaliser pour mon garçon » et renseignez le prénom du garçon. Il apparaîtra sur la couverture.",
              },
              {
                step: "2",
                titre: "Payer en ligne",
                texte: `Payez ${bd.prix.toLocaleString("fr-FR")} FCFA par Mobile Money (Orange ou MTN) en ligne.`,
              },
              {
                step: "3",
                titre: "Confirmation WhatsApp",
                texte: "Après le paiement en ligne, notre équipe vous contacte via WhatsApp pour confirmer le prénom et le lieu de livraison.",
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

        <FullWidthSection title="Commandez l'esprit tranquille." tone="white" wide>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                titre: "Livraison 48h",
                texte: `En payant maintenant, on vous livre ${deliveryDateLabel}.`,
              },
              {
                titre: "Garantie de 7 jours",
                texte:
                  bd.id === "academie-genies"
                    ? "Si la BD ne fait pas sourire votre garçon, nous vous remboursons intégralement."
                    : "Si la BD ne fait pas sourire votre enfant, nous vous remboursons intégralement.",
              },
              {
                titre: "Histoire éducative",
                texte: "Une aventure pensée pour éveiller la curiosité, la confiance et l'envie d'apprendre.",
              },
            ].map(({ titre, texte }) => (
              <div key={titre} className="border-t border-green-200 pt-5">
                <h3 className="text-base font-extrabold leading-snug text-gray-950">{titre}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{texte}</p>
              </div>
            ))}
          </div>
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
          <FaqAccordion deliveryDateLabel={deliveryDateLabel} />
        </FullWidthSection>

        <FullWidthSection
          title={bd.id === "academie-genies" ? "C'est à vous de réveillez l'imagination de votre garçon." : "C'est à vous de réveillez l'imagination de votre enfant."}
          tone="dark"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base leading-7 text-green-100">
              {bd.id === "academie-genies"
                ? "Faites de votre garçon le héros de sa propre histoire !"
                : "Faites de votre enfant le héros de sa propre histoire !"}
            </p>
            <button
              onClick={() => openCheckout("mid_page_dark_section")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-extrabold text-green-900 transition-colors duration-200 hover:bg-green-50 sm:w-auto"
            >
              {primaryCtaText} <span aria-hidden="true">→</span>
            </button>
          </div>
        </FullWidthSection>

        <FullWidthSection title="Cette BD vous plaira si…" tone="green">
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {academieGeniesReasons.map((item) => (
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
              { icon: "📱", label: "Commande rapide" },
              { icon: "💳", label: "Paiement par mobile money" },
              { icon: "🚀", label: "Livraison en 48h" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700">
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <FullWidthSection title="Offrez-lui une aventure à son prénom" tone="dark">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base leading-8 text-green-100 md:text-lg">
              Sa BD personnalisée, imprimée, et livrée chez vous en 48h. Un cadeau qu&apos;il gardera toute sa vie.
            </p>
            <div className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
              à seulement
            </div>
            <div className="mt-2 text-4xl font-extrabold leading-none text-white md:text-5xl">
              {bd.prix.toLocaleString("fr-FR")} FCFA
            </div>
            {bd.id === "academie-genies" && (
              <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-left shadow-sm">
                <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-gray-600">
                  <span>Plus que 13 exemplaires</span>
                  <span>483 vendus</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full border border-amber-200 bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-500 to-red-500 transition-all duration-700 animate-pulse"
                    style={{ width: `${fomoRemainingPct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-gray-600">
                  <span>Fin de l&apos;offre promo dans {fomoTimer}</span>
                  <span>Retour à 15 000 FCFA</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => openCheckout("bottom_offer")}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-extrabold text-green-900 transition-colors duration-200 hover:bg-green-50 sm:w-auto"
            >
              {primaryCtaText} <span aria-hidden="true">→</span>
            </button>
          </div>
        </FullWidthSection>
      </main>

      <StickyCommanderBar
        onCommander={() => openCheckout("sticky_bar")}
        shakeStartId="avis-parents"
        label={primaryCtaText}
      />
      {modalOuvert && <CheckoutModal bd={bd} paymentSettings={paymentSettings} onClose={() => setModalOuvert(false)} />}
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



