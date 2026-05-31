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

interface Props {
  bd: BD;
  landingPageMode?: boolean;
  paymentSettings?: PaymentSettings;
  deliveryDateLabel: string;
}

type HeroSlide = {
  src: string;
  label: string;
};

const defaultSlideLabels = ["Couverture", "Aperçu histoire", "Héros", "Détails"];

const personalizedHeroSlidesBySeries: Record<string, HeroSlide[]> = {
  "academie-genies": [
    { src: "/covers/hero-personalized/academie-genies-kylian.webp", label: "Kylian" },
    { src: "/covers/hero-personalized/academie-genies-william.webp", label: "William" },
    { src: "/covers/hero-personalized/academie-genies-paul.webp", label: "Paul" },
    { src: "/covers/hero-personalized/academie-genies-studio-produit.webp", label: "Aperçu produit" },
  ],
};

const FAMILLES_BASE = 347;
const FAMILLES_BASE_MS = new Date("2026-05-30T00:00:00Z").getTime();

export default function BDDetailClient({ bd, landingPageMode = false, deliveryDateLabel }: Props) {
  const [modalOuvert, setModalOuvert] = useState(false);
  const [slideActif, setSlideActif] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [famillesSold] = useState(() => FAMILLES_BASE + Math.floor((Date.now() - FAMILLES_BASE_MS) / 86400000) * 10);
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
      if (delta > 0) slideSuivant();
      else slidePrecedent();
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

  return (
    <>
      {/* SECTION 1 : HERO */}
      <section className="relative overflow-hidden bg-[#0d1f0d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.08),transparent_40%)]" />
        <div className="relative max-w-lg mx-auto px-4 pt-5 pb-10">
          {!landingPageMode && (
            <Link href="/catalogue" className="inline-flex items-center gap-1 text-green-400 hover:text-green-200 text-sm mb-5">
              ← Nos autres BD
            </Link>
          )}

          <div className="text-center mb-5">
            <span className="inline-block border border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              📚 BD Personnalisée · Livraison Yaoundé &amp; Douala
            </span>
          </div>

          <h1 className="text-center text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
            Le livre qui donnera à votre enfant{" "}
            <span className="text-amber-400">l&apos;amour de la lecture</span>
          </h1>

          {bd.nombreAvis > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stars note={bd.note} />
              <span className="font-bold text-sm">{bd.note}/5</span>
              <span className="text-green-300 text-sm">· {bd.nombreAvis} avis parents</span>
            </div>
          )}

          <p className="text-center text-green-200 text-base leading-relaxed mb-6 max-w-sm mx-auto">
            Son prénom sur la couverture et dans tous les dialogues. Imprimé en couleur, livré chez vous sous 48h.
          </p>

          {/* Carousel */}
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-black/30 shadow-xl mb-6"
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

          {/* CTA principal */}
          <button
            onClick={() => openCheckout("hero_cta")}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-colors mb-4"
          >
            <WhatsAppIcon />
            Personnaliser pour mon enfant
          </button>

          {/* Preuve sociale */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {bd.avis.slice(0, 3).map((avis, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0d1f0d] flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: ["#166534", "#15803d", "#14532d"][i] }}
                >
                  {avis.avatar}
                </div>
              ))}
            </div>
            <span className="text-green-200 text-sm font-semibold">{famillesSold} familles satisfaites</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 : VSL PLACEHOLDER */}
      <section className="bg-[#111] py-10 px-4">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={() => openCheckout("vsl_cta")}
            aria-label="Voir comment votre enfant devient le héros"
            className="relative w-full rounded-2xl overflow-hidden bg-[#0d1f0d] shadow-2xl border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            style={{ aspectRatio: "16/9" }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/90 flex items-center justify-center shadow-xl">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white ml-1" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-white/80 text-sm font-semibold px-4 text-center">
                Voir comment votre enfant devient le héros de l&apos;histoire
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* SECTION 3 : LA PROMESSE */}
      <section className="bg-white px-4 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 h-1 w-14 bg-green-700" />
          <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950 mb-6">
            Ce n&apos;est pas juste un livre.
            <br />
            <span className="text-green-700">C&apos;est la confiance en soi.</span>
          </h2>
          <div className="space-y-4 text-base leading-8 text-gray-700 md:text-lg">
            <p>
              Quand votre enfant voit <strong>son prénom sur la couverture</strong>, quelque chose se passe. Il réalise que ce livre a été fait <em>pour lui</em>.
            </p>
            <p>
              Il lit. Il relit. Il raconte l&apos;histoire à sa famille. Parce que dans cette histoire,{" "}
              <strong>c&apos;est lui le génie</strong>.
            </p>
            <p>
              Vous ne lui offrez pas juste une BD. Vous lui offrez la conviction qu&apos;il est capable de grandes choses —{" "}
              <strong>intelligent, curieux, ambitieux</strong>.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: "📖", titre: "Il lira sans qu'on le lui demande", desc: "Son prénom dans chaque page le captive" },
              { icon: "🧠", titre: "Il croit en ses capacités", desc: "L'histoire lui dit qu'il est intelligent" },
              { icon: "🎁", titre: "Un souvenir pour toujours", desc: "Une BD qu'il gardera toute sa vie" },
            ].map(({ icon, titre, desc }) => (
              <div key={titre} className="border-t-2 border-green-200 pt-4">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-extrabold text-gray-900">{titre}</div>
                <div className="mt-1 text-sm text-gray-600">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 : COMMENT ÇA MARCHE */}
      <section className="bg-amber-50 px-4 py-14 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 h-1 w-14 bg-green-700" />
          <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950 mb-8">
            Commandez en 2 étapes
          </h2>
          <ol className="grid gap-6 sm:grid-cols-2">
            {[
              {
                step: "1",
                titre: "Entrez le prénom de votre enfant",
                texte:
                  "Cliquez sur le bouton, indiquez le prénom et le sexe. Son prénom sera intégré sur la couverture et dans tous les dialogues.",
              },
              {
                step: "2",
                titre: "On vous livre via WhatsApp",
                texte:
                  "Notre équipe vous contacte sous 30 min pour confirmer la commande et organiser la livraison à Yaoundé ou Douala.",
              },
            ].map(({ step, titre, texte }) => (
              <li key={step} className="relative border-t-2 border-green-700 pt-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-sm font-extrabold text-white">
                  {step}
                </div>
                <h3 className="text-base font-extrabold leading-snug text-gray-950">{titre}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{texte}</p>
              </li>
            ))}
          </ol>
          <button
            onClick={() => openCheckout("steps_section")}
            className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-7 py-4 text-base font-extrabold text-white transition-colors shadow-md"
          >
            <WhatsAppIcon />
            Personnaliser pour mon enfant
          </button>
        </div>
      </section>

      {/* SECTION 5 : AVIS PARENTS */}
      <div id="avis-parents">
        <section className="bg-white px-4 py-14 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 h-1 w-14 bg-green-700" />
            <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950 mb-2">
              Ce que disent les parents
            </h2>
            <div className="flex items-center gap-2 mb-8">
              <Stars note={bd.note} />
              <span className="font-bold text-sm text-gray-900">{bd.note}/5</span>
              <span className="text-gray-500 text-sm">· {bd.nombreAvis} avis vérifiés</span>
            </div>
            <div className="divide-y divide-gray-100">
              {bd.avis.map((avis, i) => (
                <article key={i} className={i === 0 ? "pb-6" : "py-6"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: ["#166534", "#15803d", "#14532d"][i % 3] }}
                      >
                        {avis.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-950">{avis.nom}</div>
                        <div className="text-xs text-gray-500">{avis.ville} · {avis.date}</div>
                      </div>
                    </div>
                    <Stars note={avis.note} small />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-gray-700">« {avis.commentaire} »</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 6 : UN CADEAU QU'IL N'OUBLIERA JAMAIS */}
      <section className="bg-[#0d1f0d] text-white px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 h-1 w-14 bg-amber-400 mx-auto" />
          <h2 className="text-2xl font-extrabold leading-tight md:text-3xl mb-6">
            Un cadeau qu&apos;il n&apos;oubliera jamais
          </h2>
          <p className="text-base leading-8 text-green-100 md:text-lg mb-4">
            La plupart des cadeaux sont oubliés en quelques jours. Pas celui-là.
          </p>
          <p className="text-base leading-8 text-green-100 md:text-lg mb-8">
            Une BD avec <strong className="text-white">son prénom</strong>, imprimée en couleur, qu&apos;il lira et relira. Un souvenir d&apos;enfance qu&apos;il gardera toute sa vie — et qui lui dira qu&apos;il est capable de tout.
          </p>
          <button
            onClick={() => openCheckout("gift_section")}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-8 py-4 text-base font-extrabold text-white transition-colors shadow-lg"
          >
            <WhatsAppIcon />
            Personnaliser pour mon enfant
          </button>
        </div>
      </section>

      {/* SECTION 7 : LIVRAISON */}
      <section className="bg-green-50 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 h-1 w-14 bg-green-700" />
          <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950 mb-6">
            📍 Livraison à Yaoundé et Douala
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "🚀", titre: "Sous 48h", desc: "Après confirmation de la commande sur WhatsApp" },
              { icon: "💰", titre: "1 000 FCFA", desc: "Frais de livraison payés directement au livreur" },
              { icon: "📱", titre: "Mobile Money", desc: "Orange Money ou MTN MoMo — simple et rapide" },
            ].map(({ icon, titre, desc }) => (
              <div key={titre} className="bg-white rounded-xl p-4 border border-green-100">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-extrabold text-gray-900">{titre}</div>
                <div className="mt-1 text-sm text-gray-600">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 : CTA FINAL */}
      <section className="bg-white px-4 py-14 md:py-20 border-t border-gray-100">
        <div className="mx-auto max-w-lg text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h2 className="text-2xl font-extrabold leading-tight md:text-3xl text-gray-950 mb-4">
            Offrez-lui une aventure à son prénom
          </h2>
          <p className="text-base text-gray-500 leading-7 mb-6">
            {bd.nombrePages} pages illustrées · Personnalisée avec son prénom · {deliveryDateLabel}
          </p>
          <div className="mb-5">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-gray-400 line-through text-base">15 000 FCFA</span>
              <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">-34%</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-950">
              {bd.prix.toLocaleString("fr-FR")} <span className="text-xl font-bold text-gray-500">FCFA</span>
            </div>
          </div>
          <button
            onClick={() => openCheckout("final_cta")}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 px-8 py-4 text-base font-extrabold text-white transition-colors shadow-lg"
          >
            <WhatsAppIcon />
            Personnaliser pour mon enfant
          </button>
          <p className="mt-4 text-xs text-gray-500">
            📍 Livraison Yaoundé &amp; Douala · {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA à la réception
          </p>
        </div>
      </section>

      <StickyCommanderBar
        onCommander={() => openCheckout("sticky_bar")}
        shakeStartId="avis-parents"
        label="Personnaliser pour mon enfant"
      />

      {modalOuvert && <CheckoutModal bd={bd} onClose={() => setModalOuvert(false)} />}
    </>
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
          className={i < full ? "text-yellow-400" : half && i === full ? "text-yellow-300" : "text-gray-200"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
