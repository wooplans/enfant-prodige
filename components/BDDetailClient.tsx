"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BD } from "@/lib/catalogue";
import type { PaymentSettings } from "@/lib/payment-settings";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import CheckoutModal from "@/components/CheckoutModal";
import { fbqTrack } from "@/components/FacebookPixel";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

// Bascule saisonnière "grandes vacances". Mettre à false hors saison.
const VACANCES_MODE = true;

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
    {
      src: "/covers/hero-personalized/academie-genies-studio-produit.webp",
      label: "Aperçu produit",
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
    if (Math.abs(delta) > 40) delta > 0 ? slideSuivant() : slidePrecedent();
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
  const childNoun = bd.id === "academie-genies" ? "votre garçon" : "votre enfant";
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
  const FAMILLES_BASE = 347;
  const FAMILLES_BASE_MS = new Date("2026-05-30T00:00:00Z").getTime();
  const fomoSold = bd.id === "academie-genies"
    ? FAMILLES_BASE + Math.floor((Date.now() - FAMILLES_BASE_MS) / 86400000) * 10
    : null;
  const fomoTotal = fomoRemaining !== null && fomoSold !== null ? fomoRemaining + fomoSold : null;
  const fomoRemainingPct =
    fomoTotal && fomoRemaining !== null ? Math.max(3, Math.round((fomoRemaining / fomoTotal) * 100)) : 0;
  const ratingBreakdown = getRatingBreakdown(bd.note, bd.nombreAvis);

  return (
    <>
      {/* BANDEAU CONFIANCE */}
      {bd.id === "academie-genies" && (
        <div className="overflow-hidden bg-green-950 text-white py-2 px-4">
          <div className="flex animate-[trust-scroll_20s_linear_infinite] whitespace-nowrap gap-8 text-xs font-semibold sm:justify-center sm:animate-none sm:whitespace-normal sm:flex-wrap sm:gap-6">
            <span>⭐ {bd.note}/5 · {bd.nombreAvis} avis parents</span>
            <span className="hidden sm:inline text-green-600">·</span>
            <span>👪 {fomoSold} parents ont déjà commandé</span>
            <span className="hidden sm:inline text-green-600">·</span>
            <span>🚚 Livraison Yaoundé &amp; Douala</span>
            <span className="hidden sm:inline text-green-600">·</span>
            <span>✅ Garantie 7 jours satisfait ou remboursé</span>
            <span className="sm:hidden">⭐ {bd.note}/5 · {bd.nombreAvis} avis parents</span>
            <span className="sm:hidden">👪 {fomoSold} parents ont déjà commandé</span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.15),transparent_30%),linear-gradient(135deg,rgba(22,101,52,0.95),rgba(6,78,59,0.98))]" />
        <div className="relative max-w-lg mx-auto px-4 pt-5 pb-10">
          {!landingPageMode && (
            <Link href="/catalogue" className="inline-flex items-center gap-1 text-green-400 hover:text-green-200 text-sm mb-5">
              ← Nos autres BD
            </Link>
          )}

          {/* Badge */}
          <div className="text-center mb-5">
            <span className="inline-block border border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              📚 BD Personnalisée · Vacances 2026
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-center text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            {bd.id === "academie-genies" ? (
              <>Votre garçon, héros de <span className="text-amber-400">{bd.serie}</span></>
            ) : (
              <>Votre enfant, héros de <span className="text-amber-400">{bd.serie}</span></>
            )}
          </h1>

          {/* Note */}
          {bd.nombreAvis > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stars note={bd.note} />
              <span className="font-bold text-sm">{bd.note}/5</span>
              <span className="text-green-300 text-sm">· +{bd.nombreAvis} avis</span>
            </div>
          )}

          {/* Sous-titre */}
          <p className="text-center text-green-100 text-base leading-relaxed mb-6 max-w-sm mx-auto">
            {heroSubtitle}
          </p>

          {/* Carousel */}
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-green-950 shadow-xl mb-6"
            style={{ aspectRatio: "16/9" }}
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
                sizes="(min-width: 512px) 480px, 100vw"
                className={`object-cover transition-opacity duration-500 ${slideActif === index ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <button
              onClick={slidePrecedent}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 z-10 w-9 h-9 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center text-sm backdrop-blur-sm"
            >
              ←
            </button>
            <button
              onClick={slideSuivant}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 z-10 w-9 h-9 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center text-sm backdrop-blur-sm"
            >
              →
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="text-xs font-bold text-white mb-2">{slides[slideActif]?.label}</div>
              <div className="flex gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.src}
                    onClick={() => {
                      trackProductEvent("carousel_interaction", "hero_dot", { slideIndex: index, slideLabel: slide.label });
                      setSlideActif(index);
                    }}
                    aria-label={`Image ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${slideActif === index ? "w-6 bg-amber-400" : "w-1.5 bg-white/50 hover:bg-white"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-green-400/70 line-through text-base">15 000 FCFA</span>
              <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">-34%</span>
            </div>
            <div className="text-5xl font-extrabold text-white leading-none">
              {bd.prix.toLocaleString("fr-FR")} <span className="text-2xl font-bold text-green-300">FCFA</span>
            </div>
          </div>

          {/* FOMO bar */}
          {bd.id === "academie-genies" && (
            <div className="mb-5 rounded-2xl border border-amber-200/30 bg-amber-400/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-amber-200 mb-2">
                <span>Plus que 13 exemplaires</span>
                <span>Offre expire dans {fomoTimer}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-700 animate-pulse"
                  style={{ width: `${fomoRemainingPct}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA principal */}
          <button
            onClick={() => openCheckout("hero_cta")}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-colors mb-3"
          >
            <WhatsAppIcon />
            {primaryCtaText}
          </button>

          {/* Logos Mobile Money */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <MobileMoneyLogos />
            <p className="text-green-300 text-xs">Orange Money · MTN MoMo · Livraison {deliveryDateLabel}</p>
          </div>

          {/* Preuve sociale */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {bd.avis.slice(0, 3).map((avis, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-green-900 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: ["#166534", "#15803d", "#14532d"][i] }}
                >
                  {avis.avatar}
                </div>
              ))}
            </div>
            <span className="text-green-200 text-sm font-semibold">
              {fomoSold} familles satisfaites
            </span>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <main className="bg-white pb-28">
        {/* SECTION VACANCES (saisonnière) */}
        {VACANCES_MODE && (
          <section className="bg-amber-50 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <div className="mb-4 h-1 w-14 bg-green-700" />
                <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950">
                  🌴 Ces vacances, offrez-lui mieux que des écrans
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700 md:text-lg">
                  Les grandes vacances arrivent : deux longs mois à remplir. Entre la télé en boucle et les
                  « je m&apos;ennuie… », difficile d&apos;occuper {childNoun} sans bataille. Et si ces vacances lui
                  laissaient un vrai souvenir ?
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-amber-200 bg-white p-6">
                  <h3 className="text-base font-extrabold text-gray-950">Sans rien de spécial :</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-700">
                    <li className="flex gap-3"><span aria-hidden="true">📺</span><span>Des heures d&apos;écrans, et l&apos;impression que rien ne reste.</span></li>
                    <li className="flex gap-3"><span aria-hidden="true">😮‍💨</span><span>« Je m&apos;ennuie… » répété dix fois par jour.</span></li>
                    <li className="flex gap-3"><span aria-hidden="true">📚</span><span>Des livres ouverts deux minutes, puis abandonnés.</span></li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <h3 className="text-base font-extrabold text-green-900">Avec sa BD personnalisée :</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-700">
                    <li className="flex gap-3"><span aria-hidden="true">🦸🏾</span><span>Il <strong className="font-bold text-green-900">devient le héros</strong> — son prénom sur la couverture et dans les dialogues.</span></li>
                    <li className="flex gap-3"><span aria-hidden="true">📖</span><span>Il lit, il relit, il raconte. Sans qu&apos;on le lui demande.</span></li>
                    <li className="flex gap-3"><span aria-hidden="true">✨</span><span>Il se sent capable, intelligent, fier. Et il y croit.</span></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-start gap-3">
                <button
                  onClick={() => openCheckout("vacances_section")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-4 text-base font-extrabold text-white transition-colors hover:bg-green-600 shadow-md sm:w-auto"
                >
                  Occuper {childNoun} intelligemment <span aria-hidden="true">→</span>
                </button>
                <p className="text-sm leading-6 text-gray-600">
                  Les commandes augmentent à l&apos;approche des vacances — réservez la sienne maintenant pour être livré à temps.
                </p>
              </div>
            </div>
          </section>
        )}

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

        {/* SECTION ÉMOTIONNELLE */}
        {bd.id === "academie-genies" && (
          <section className="bg-amber-50 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 h-1 w-14 bg-green-700 mx-auto" />
              <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950">
                Imaginez son visage quand il ouvre le livre…
              </h2>
              <p className="mt-5 text-base leading-8 text-gray-700 md:text-lg">
                Il voit <strong>son prénom</strong> sur la couverture. Il se reconnaît dans les dialogues.
                Il réalise que <strong>cette BD a été faite uniquement pour lui</strong>.
              </p>
              <p className="mt-4 text-base leading-8 text-gray-700 md:text-lg">
                Vous ne lui offrez pas juste un livre. Vous lui offrez <strong>la certitude qu'il est capable de grandes choses</strong> — intelligent, courageux, un vrai génie.
              </p>
              <button
                onClick={() => openCheckout("emotion_section")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-4 text-base font-extrabold text-white transition-colors hover:bg-green-600 shadow-md"
              >
                {primaryCtaText} <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}

        <FullWidthSection title="Sa BD personnalisée en 3 étapes simples" tone="warm" wide>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "1",
                titre: "Tapez son prénom",
                texte: "Entrez le prénom de votre garçon. Il apparaîtra sur la couverture et dans les dialogues — exactement comme vous l'écrivez.",
              },
              {
                step: "2",
                titre: "Payez par Orange Money ou MTN",
                texte: `Réglez ${bd.prix.toLocaleString("fr-FR")} FCFA directement depuis votre téléphone. Pas besoin d'aller à l'agence.`,
              },
              {
                step: "3",
                titre: "Reçu chez vous sous 48h",
                texte: "Notre équipe vous contacte sur WhatsApp sous 30 min pour confirmer, puis vous livre à Yaoundé ou Douala.",
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
          <div className="mt-8 flex flex-col items-center gap-2">
            <MobileMoneyLogos />
            <p className="text-xs text-gray-500 font-medium">Orange Money · MTN Mobile Money · Paiement sécurisé</p>
          </div>
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

        {/* SECTION COMPARAISON */}
        {bd.id === "academie-genies" && (
          <FullWidthSection title="Pourquoi c'est différent d'un cadeau classique" tone="white" wide>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="w-1/2 pb-4 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Cadeau classique</th>
                    <th className="w-1/2 pb-4 text-left text-xs font-bold uppercase tracking-wide text-green-700">BD Académie des Génies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["L'enfant l'oublie en quelques jours", "Il la relit encore et encore — c'est SA BD"],
                    ["Rien de personnel, rien d'unique", "Son prénom sur la couverture et dans les dialogues"],
                    ["Aucun message éducatif", "Il apprend que l'intelligence et l'ambition, ça paye"],
                    ["Difficile à trouver au Cameroun", "Commandé en ligne, livré chez vous à Yaoundé ou Douala"],
                  ].map(([bad, good]) => (
                    <tr key={bad}>
                      <td className="py-3 pr-6 text-gray-500">✗ {bad}</td>
                      <td className="py-3 font-semibold text-green-800">✓ {good}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FullWidthSection>
        )}

        {/* SECTION ZONE DE LIVRAISON */}
        {bd.id === "academie-genies" && (
          <section className="bg-green-50 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <div className="mb-4 h-1 w-14 bg-green-700" />
                <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950">
                  📍 Nous livrons à Yaoundé et Douala
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-green-200 bg-white p-5">
                  <h3 className="text-base font-extrabold text-green-900 mb-3">Yaoundé</h3>
                  <p className="text-sm leading-7 text-gray-600">
                    Bastos · Omnisport · Nlongkak · Biyem-Assi · Cité Verte · Mvan · Melen · Mvog-Mbi · Mokolo · Mendong · Ngoa-Ekelle · et tous les autres quartiers
                  </p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-white p-5">
                  <h3 className="text-base font-extrabold text-green-900 mb-3">Douala</h3>
                  <p className="text-sm leading-7 text-gray-600">
                    Akwa · Bonapriso · Bonanjo · Makepe · Ndokotti · Logbessou · Kotto · Deido · Bali · New-Bell · Bepanda · et tous les autres quartiers
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm font-semibold text-gray-700 text-center">
                Frais de livraison : <strong>1 000 FCFA</strong> — réglés directement au livreur à la réception · Délai : <strong>48h</strong> après confirmation du paiement
              </p>
            </div>
          </section>
        )}

        <FullWidthSection title="Questions fréquentes" tone="warm">
          <FaqAccordion deliveryDateLabel={deliveryDateLabel} />
        </FullWidthSection>

        <FullWidthSection
          title={bd.id === "academie-genies" ? "C'est à vous de réveiller l'imagination de votre garçon." : "C'est à vous de réveiller l'imagination de votre enfant."}
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

        <FullWidthSection title="Offrez-lui une aventure à son prénom" tone="dark">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base leading-8 text-green-100 md:text-lg">
              Sa BD personnalisée, imprimée en couleur, livrée chez vous à Yaoundé ou Douala en 48h. Un cadeau qu&apos;il gardera toute sa vie.
            </p>
            <div className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
              Offre de lancement
            </div>
            <div className="mt-2 text-4xl font-extrabold leading-none text-white md:text-5xl">
              {bd.prix.toLocaleString("fr-FR")} FCFA
            </div>
            <div className="mt-3 text-sm font-semibold text-green-200">✅ Satisfait ou remboursé sous 7 jours</div>
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
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-8 py-4 text-base font-extrabold text-white transition-colors shadow-lg sm:w-auto"
            >
              <WhatsAppIcon />
              {primaryCtaText}
            </button>
            <div className="mt-4 flex flex-col items-center gap-2">
              <MobileMoneyLogos light />
              <p className="text-xs text-green-300">Orange Money · MTN Mobile Money · Paiement sécurisé</p>
            </div>
            <p className="mt-3 text-xs text-green-400">📍 Livraison Yaoundé &amp; Douala · {deliveryDateLabel}</p>
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MobileMoneyLogos({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* Orange Money */}
      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${light ? "bg-white/15 text-white" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <circle cx="12" cy="12" r="12" className={light ? "fill-orange-400" : "fill-orange-500"} />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">O</text>
        </svg>
        Orange Money
      </div>
      {/* MTN MoMo */}
      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${light ? "bg-white/15 text-white" : "bg-yellow-50 text-yellow-800 border border-yellow-200"}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <circle cx="12" cy="12" r="12" className="fill-yellow-400" />
          <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a1a1a">MTN</text>
        </svg>
        MTN MoMo
      </div>
    </div>
  );
}

function Stars({ note, small }: { note: number; small?: boolean }) {
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  return (
    <div className={`flex items-center gap-0.5 ${small ? "text-sm" : "text-base"}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < full ? "text-yellow-400" : half && i === full ? "text-yellow-300" : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}



