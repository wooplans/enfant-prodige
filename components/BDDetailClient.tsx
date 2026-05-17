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
  const lastCheckoutOpenAt = useRef(0);
  const isAcademieGenies = bd.id === "academie-genies";
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

  const synopsisTexte =
    bd.id === "apprentis-explorateurs"
      ? "Votre enfant est invité à rejoindre l'équipe des Apprentis Explorateurs pour une expédition à travers les plus beaux paysages d'Afrique : la savane du Cameroun, les chutes de la Lobé, le lac Tchad et bien plus encore. Guidé par ses compagnons, il découvre la géographie, les animaux et les cultures de son continent."
      : isAcademieGenies
        ? "Votre garçon ne reçoit pas une BD comme les autres : il entre dans l'Académie des Génies, voit son prénom sur la couverture, lit son nom dans les dialogues et devient le héros d'une mission scientifique qui valorise son intelligence."
        : bd.descriptionLongue;
  const heroTitle = isAcademieGenies ? "Offrez à votre garçon une BD où il devient le héros" : bd.serie;
  const heroSubtitle =
    isAcademieGenies
      ? "Son prénom apparaît sur la couverture et dans l'histoire. Une BD personnalisée, imprimée en couleur, livrée à Douala ou Yaoundé."
      : bd.description;
  const primaryCtaText = isAcademieGenies ? "Créer la BD de mon garçon" : "Personnaliser pour mon enfant";
  const academieGeniesReasons =
    isAcademieGenies
      ? [
          "Votre garçon a entre 7 et 12 ans et aime les aventures",
          "Vous voulez l'encourager à lire sans le forcer",
          "Vous cherchez un cadeau d'anniversaire ou de récompense vraiment mémorable",
          "Vous voulez qu'il se voie comme un héros intelligent, curieux et capable",
        ]
      : bd.pourQui;
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
              {isAcademieGenies && (
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-sm md:max-w-xl">
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                    <span className="text-sm font-bold text-green-100 line-through">15 000 FCFA</span>
                    <span className="text-4xl font-extrabold leading-none text-white">9 900 FCFA</span>
                    <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-extrabold uppercase text-green-950">
                      Offre de lancement
                    </span>
                  </div>
                  <button
                    onClick={() => openCheckout("hero_offer")}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-300 px-5 py-3.5 text-base font-extrabold text-green-950 transition-colors duration-200 hover:bg-yellow-200 sm:w-auto"
                  >
                    Créer la BD de mon garçon <span aria-hidden="true">→</span>
                  </button>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-green-50 sm:grid-cols-3">
                    <span>Paiement Mobile Money</span>
                    <span>Douala & Yaoundé</span>
                    <span>Garantie 7 jours</span>
                  </div>
                </div>
              )}
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
        <FullWidthSection title={isAcademieGenies ? "Le cadeau qui le met au centre de l'histoire" : "À propos de cette série"} tone="white">
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
                <LaunchOfferBox />
              )}
            </div>
          </div>
        </FullWidthSection>

        {isAcademieGenies && (
          <>
            <FullWidthSection title="Imaginez sa réaction quand il découvre son prénom" tone="warm" wide>
              <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
                <div className="space-y-4 text-base leading-8 text-gray-700 md:text-lg">
                  <p>
                    Il ouvre le livre, voit son prénom sur la couverture, puis comprend que l&apos;aventure parle de lui.
                    Ce n&apos;est plus seulement une histoire à lire : c&apos;est son histoire.
                  </p>
                  <p>
                    Pour un garçon de 7 à 12 ans, devenir le héros d&apos;une mission de génie peut transformer un simple cadeau
                    en souvenir qu&apos;il voudra montrer, relire et garder.
                  </p>
                </div>
                <div className="grid gap-3">
                  {[
                    "Il se reconnaît dans le rôle du héros",
                    "Il lit son prénom dans les dialogues",
                    "Il reçoit un livre physique à garder",
                    "Il associe lecture, science et confiance en soi",
                  ].map((item) => (
                    <div key={item} className="border-t border-amber-200 pt-4 text-sm font-bold leading-6 text-gray-800">
                      <span className="mr-2 text-green-700">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FullWidthSection>

            <FullWidthSection title="Son prénom apparaît vraiment dans la BD" tone="white" wide>
              <div className="grid gap-8 md:grid-cols-[420px_minmax(0,1fr)] md:items-center">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-green-100 bg-green-950 shadow-xl">
                  <Image
                    src="/covers/hero-personalized/academie-genies-kylian.webp"
                    alt="Exemple de BD personnalisée Académie des Génies avec prénom"
                    fill
                    sizes="(min-width: 768px) 420px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-base leading-8 text-gray-700 md:text-lg">
                    Après votre paiement, notre équipe vous contacte sur WhatsApp pour confirmer le prénom exact et le lieu
                    de livraison. Le prénom est ensuite intégré sur la couverture et dans les bulles de dialogue.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {["Kylian", "William", "Paul"].map((name) => (
                      <div key={name} className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-center">
                        <div className="text-xs font-bold uppercase text-green-700">Exemple</div>
                        <div className="mt-1 text-lg font-extrabold text-green-950">{name}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => openCheckout("personalization_section")}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3.5 text-base font-extrabold text-white transition-colors duration-200 hover:bg-green-600 sm:w-auto"
                  >
                    Personnaliser avec son prénom <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </FullWidthSection>

            <FullWidthSection title="Pourquoi les garçons de 7 à 12 ans accrochent vite" tone="green" wide>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Héros de l'histoire", "Il ne regarde pas seulement un personnage : il devient le personnage principal."],
                  ["Mission de génie", "L'aventure met en avant l'intelligence, la curiosité et les idées."],
                  ["Lecture plus facile", "Son prénom crée une attention immédiate, même s'il lit peu d'habitude."],
                  ["Cadeau souvenir", "La BD imprimée reste à la maison, prête à être relue ou montrée."],
                ].map(([titre, texte]) => (
                  <div key={titre} className="border-t border-green-200 pt-5">
                    <h3 className="text-base font-extrabold leading-snug text-gray-950">{titre}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{texte}</p>
                  </div>
                ))}
              </div>
            </FullWidthSection>

            <FullWidthSection title="Disponible maintenant à Douala et Yaoundé" tone="white">
              <div className="rounded-2xl border border-green-100 bg-green-50 p-5 md:p-7">
                <p className="text-base leading-8 text-gray-700 md:text-lg">
                  Pour cette phase de test, les commandes sont concentrées sur Douala et Yaoundé afin d&apos;assurer une
                  personnalisation suivie, une confirmation WhatsApp rapide et une livraison maîtrisée.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white px-4 py-4 font-extrabold text-green-950 shadow-sm">Livraison à Douala</div>
                  <div className="rounded-xl bg-white px-4 py-4 font-extrabold text-green-950 shadow-sm">Livraison à Yaoundé</div>
                </div>
              </div>
            </FullWidthSection>
          </>
        )}

        <FullWidthSection title="Sa BD personnalisée en 3 étapes simples" tone="warm" wide>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "1",
                titre: "Entrez le prénom de votre garçon",
                texte: "Cliquez sur le bouton de commande et indiquez le prénom qui doit apparaître dans la BD.",
              },
              {
                step: "2",
                titre: "Payer en ligne",
                texte: "Payez 9 900 FCFA par Orange Money ou MTN Mobile Money, puis recevez la confirmation.",
              },
              {
                step: "3",
                titre: "Confirmation WhatsApp",
                texte: "Notre équipe confirme le prénom, la ville et le lieu de livraison avant l'impression.",
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

        <FullWidthSection title="Commandez l'esprit tranquille" tone="white" wide>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                titre: isAcademieGenies ? "Livraison Douala & Yaoundé" : "Livraison 48h",
                texte: isAcademieGenies
                  ? `En payant maintenant, on vous livre ${deliveryDateLabel} à Douala ou Yaoundé.`
                  : `En payant maintenant, on vous livre ${deliveryDateLabel}.`,
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
            <FullWidthSection title={isAcademieGenies ? `Des parents de Douala et Yaoundé l'ont déjà offert · ${bd.note}/5` : `Avis parents · ${bd.note}/5`} tone="white" wide>
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
          title={isAcademieGenies ? "Faites-lui découvrir une histoire où il compte vraiment" : "C'est à vous de réveillez l'imagination de votre enfant."}
          tone="dark"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base leading-7 text-green-100">
              {isAcademieGenies
                ? "Offrez-lui une BD personnalisée avec son prénom, imprimée et livrée à Douala ou Yaoundé."
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
              9 900 FCFA
            </div>
            {bd.id === "academie-genies" && (
              <LaunchOfferBox dark />
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

function LaunchOfferBox({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-4 text-left shadow-sm ${
        dark ? "border-yellow-200 bg-yellow-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-wide text-green-800">Offre de lancement Douala & Yaoundé</div>
      <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">
        Prix test à 9 900 FCFA pendant la phase de lancement. Après validation, le tarif standard repasse à 15 000 FCFA.
      </p>
    </div>
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



