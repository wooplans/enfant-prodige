"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import WhatsAppLeadModal from "@/components/WhatsAppLeadModal";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";
import { fbqTrack } from "@/components/FacebookPixel";
import type { BD } from "@/lib/catalogue";

interface Props {
  bd: BD;
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-current"
    >
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.32.17 11.89c0 2.09.55 4.13 1.58 5.92L0 24l6.38-1.67a11.87 11.87 0 0 0 5.68 1.44h.01c6.56 0 11.89-5.33 11.89-11.9 0-3.18-1.24-6.16-3.44-8.39ZM12.07 21.76h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.84 9.84 0 0 1-1.5-5.19c0-5.47 4.45-9.91 9.93-9.91 2.65 0 5.14 1.03 7.01 2.91a9.84 9.84 0 0 1 2.9 7c0 5.47-4.45 9.92-9.91 9.92Zm5.44-7.42c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.94 1.18-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.75-1.66-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.08 4.49.71.3 1.27.48 1.7.62.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
    </svg>
  );
}

const heroSlides = [
  {
    src: "/decouvre-les-metiers/hero-discovery.webp",
    title: "Des métiers à découvrir",
    text: "Votre enfant avance d’univers en univers pour comprendre des métiers utiles, concrets et inspirants.",
  },
  {
    src: "/decouvre-les-metiers/hero-planning.webp",
    title: "Une histoire avec son prénom",
    text: "Son prénom entre dans l’aventure pour l’aider à se projeter et à rêver plus grand.",
  },
  {
    src: "/decouvre-les-metiers/hero-future.webp",
    title: "Il imagine son avenir",
    text: "Lecture, activités et coloriages prolongent l’apprentissage bien après la fin de la BD.",
  },
];

const benefitCards = [
  {
    title: "Métiers inspirants",
    text: "Une aventure qui fait découvrir plusieurs métiers et leur rôle dans la vie de tous les jours.",
    tone: "bg-purple-100 text-purple-950",
    icon: "M",
  },
  {
    title: "Activités et coloriages",
    text: "Des prolongements ludiques pour continuer à apprendre après la lecture.",
    tone: "bg-orange-100 text-orange-950",
    icon: "A",
  },
  {
    title: "Histoire personnalisée",
    text: "Le prénom de votre enfant apparaît dans l’histoire pour le placer au cœur de la découverte.",
    tone: "bg-teal-100 text-teal-950",
    icon: "P",
  },
];

const steps = [
  ["Commandez sur WhatsApp", "Indiquez le prénom, le sexe et la ville de livraison."],
  [
    "Recevez la confirmation",
    "Vous effectuez le paiement et nous personnalisons la BD avec le nom de votre enfant avant impression.",
  ],
  [
    "Recevez la bande dessinée",
    "Nous vous livrons ou expédions la bande dessinée accompagnée des couleurs pour le coloriage.",
  ],
];

const faqs = [
  {
    q: "Que découvre mon enfant dans cette BD ?",
    a: "Il explore plusieurs métiers inspirants, comprend leur rôle et commence à imaginer ce qu’il aime et ce qu’il pourrait devenir.",
  },
  {
    q: "Le prénom apparaît-il vraiment dans la BD ?",
    a: "Oui. Le prénom transmis dans le formulaire est utilisé pour personnaliser l’aventure.",
  },
  {
    q: "Est-ce une BD physique ?",
    a: "Oui. L’offre concerne une BD physique personnalisée, imprimée en couleur, avec des activités et des coloriages.",
  },
  {
    q: "Comment se fait la commande ?",
    a: "Vous remplissez trois informations, puis WhatsApp s’ouvre avec votre demande déjà prête.",
  },
];

const yaoundeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Douala",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getYaoundeDateParts(date: Date) {
  const parts = yaoundeFormatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getMillisecondsUntilYaoundeDeadline(now = new Date()) {
  const { year, month, day } = getYaoundeDateParts(now);
  const targetToday = Date.UTC(year, month - 1, day, 22, 59, 0);
  const target =
    now.getTime() < targetToday ? targetToday : Date.UTC(year, month - 1, day + 1, 22, 59, 0);

  return Math.max(0, target - now.getTime());
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatFcfa(value: number) {
  return `${value.toLocaleString("fr-FR").replace(/\s/g, ".")} FCFA`;
}

export default function DecouvreLesMetiersLanding({ bd }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [autoFocusModal, setAutoFocusModal] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [offerCountdown, setOfferCountdown] = useState("00:00:00");

  const openLeadModal = (source: string) => {
    fbqTrack("InitiateCheckout", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
      source,
    });

    trackAnalyticsEvent({
      eventType: "cta_click",
      metadata: {
        source,
        seriesId: bd.id,
        seriesSlug: bd.slug,
        seriesTitle: bd.serie,
      },
    });
    setModalOpen(true);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldOpenCheckout =
      searchParams.get("checkout") === "1" || searchParams.get("openCheckout") === "1";

    if (!shouldOpenCheckout) return;

    setAutoFocusModal(true);
    openLeadModal("direct_link");
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      setOfferCountdown(formatCountdown(getMillisecondsUntilYaoundeDeadline()));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentHeroSlide = heroSlides[heroSlideIndex];
  const oldPrice = 20000;

  return (
    <>
      <main className="bg-[#f6f5f4] pb-24 font-sans text-[#111111]">
        <div className="sticky top-0 z-40 bg-[#dd5b00] px-4 py-2 text-center text-sm font-extrabold text-white shadow-md">
          Offre flash : {formatFcfa(bd.prix)}. Fin dans {offerCountdown}
        </div>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1fr_0.95fr] md:items-center md:px-6 md:py-16">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#e6e6e6] bg-white px-3 py-1.5 text-xs font-bold text-[#0075de] shadow-sm">
              <span className="text-[#dd5b00]">*****</span>
              <span>4,9/5</span>
              <span>325 avis parents satisfaits</span>
            </div>

            <h1 className="max-w-2xl text-[2.55rem] font-extrabold leading-none tracking-normal md:text-[4.7rem]">
              L’aventure où votre enfant{" "}
              <span className="text-[#0075de]">découvre les métiers !</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#615d59] md:text-lg">
              Offrez une BD personnalisée où votre enfant explore des métiers inspirants,
              comprend leur rôle, imagine son avenir et apprend en s’amusant.
            </p>

            <div className="mt-6 inline-flex rounded-lg border border-[#e6e6e6] bg-[#dd5b00]/10 px-4 py-2 text-sm font-extrabold text-[#dd5b00]">
              Offre expire dans : {offerCountdown}
            </div>

            <div className="mt-5 flex flex-wrap items-baseline justify-center gap-3 md:justify-start">
              <span className="font-extrabold">Seulement</span>
              <span className="text-3xl font-extrabold text-[#0075de]">
                {formatFcfa(bd.prix)}
              </span>
              <span className="text-sm text-[#a39e98] line-through">{formatFcfa(oldPrice)}</span>
            </div>

            <button
              type="button"
              onClick={() => openLeadModal("hero")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0075de] px-8 py-4 text-base font-extrabold text-white shadow-[0_14px_32px_rgba(0,117,222,0.24)] transition-colors hover:bg-[#005bab] sm:w-auto"
            >
              <WhatsAppIcon />
              Commander sur WhatsApp
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e6e6e6] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
            <Image
              src={currentHeroSlide.src}
              alt={currentHeroSlide.title}
              width={1200}
              height={900}
              priority
              quality={72}
              sizes="(max-width: 768px) 100vw, 46vw"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="border-t border-[#e6e6e6] bg-white px-5 py-4">
              <div className="font-extrabold text-[#111111]">{currentHeroSlide.title}</div>
              <p className="mt-1 text-sm leading-6 text-[#615d59]">{currentHeroSlide.text}</p>
              <div className="mt-4 flex gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setHeroSlideIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      heroSlideIndex === index ? "w-8 bg-[#0075de]" : "w-2 bg-[#d7d3ce]"
                    }`}
                    aria-label={`Voir ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e6e6e6] px-4 py-16 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-[2.1rem] font-extrabold leading-tight tracking-normal md:text-[3.2rem]">
                Un livre unique, comme lui
              </h2>
              <p className="mt-4 text-base leading-7 text-[#615d59]">
                Plus qu’une simple lecture, une véritable immersion éducative et créative.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {benefitCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-[#e6e6e6] bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.05)]"
                >
                  <div
                    className={`mb-5 grid h-11 w-11 place-items-center rounded-lg text-sm font-black ${item.tone}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-extrabold tracking-normal text-[#111111]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#615d59]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#e6e6e6] bg-white px-4 py-16 md:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1fr] md:items-center">
            <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-[#e6e6e6] bg-[#e8e8e6] shadow-[0_18px_40px_rgba(0,0,0,0.08)] md:min-h-[420px]">
              <span className="absolute -right-3 -top-3 h-16 w-16 rounded-bl-2xl bg-[#ff64c8]" />
              <span className="absolute -bottom-3 -left-3 h-14 w-14 rounded-tr-2xl bg-[#62aef0]" />
              <span className="grid h-20 w-20 place-items-center rounded-full bg-[#0075de] shadow-lg">
                <span className="ml-1 h-0 w-0 border-b-[14px] border-l-[22px] border-t-[14px] border-b-transparent border-l-white border-t-transparent" />
              </span>
            </div>

            <div>
              <h2 className="text-[2.1rem] font-extrabold leading-tight tracking-normal md:text-[3.2rem]">
                Comment ca marche ?
              </h2>
              <div className="mt-8 grid gap-5">
                {steps.map(([title, text], index) => (
                  <div key={title} className="grid grid-cols-[34px_1fr] gap-4">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#e6e6e6] bg-[#f6f5f4] text-sm font-extrabold text-[#615d59]">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[#111111]">
                        Étape {index + 1} : {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#615d59]">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e6e6e6] px-4 py-16 md:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div className="overflow-hidden rounded-2xl border border-[#e6e6e6] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
              <Image
                src="/decouvre-les-metiers/cover.webp"
                alt="Couverture personnalisée de la BD Découvre les Métiers"
                width={1000}
                height={750}
                quality={70}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div>
              <div className="mb-4 text-xs font-extrabold uppercase tracking-normal text-[#0075de]">
                Ce que votre enfant reçoit
              </div>
              <h2 className="text-[2.1rem] font-extrabold leading-tight tracking-normal md:text-[3.2rem]">
                Une aventure pour découvrir les métiers et rêver grand
              </h2>
              <div className="mt-7 grid gap-3">
                {[
                  "Une découverte de métiers inspirants et utiles",
                  "Le prénom de l’enfant intégré dans l’histoire",
                  "Des activités et coloriages pour prolonger l’apprentissage",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[#e6e6e6] bg-white px-4 py-4 text-sm font-bold leading-6 text-[#615d59]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e6e6e6] bg-white px-4 py-16 md:px-6" id="commande">
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#e6e6e6] bg-white p-6 text-center shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:p-10">
            <div className="mb-4 inline-flex rounded-full bg-[#0075de]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-normal text-[#0075de]">
              Offre limitée
            </div>
            <h2 className="text-[2rem] font-extrabold leading-tight tracking-normal md:text-[2.7rem]">
              Offre spéciale : <span className="text-[#0075de]">{formatFcfa(bd.prix)}</span>
            </h2>
            <p className="mt-3 text-sm text-[#615d59]">
              <span className="text-[#a39e98] line-through">{formatFcfa(oldPrice)}</span> -
              économisez 50% aujourd’hui
            </p>
            <button
              type="button"
              onClick={() => openLeadModal("form_section")}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0075de] px-8 py-4 text-base font-extrabold text-white shadow-[0_14px_32px_rgba(0,117,222,0.24)] transition-colors hover:bg-[#005bab]"
            >
              <WhatsAppIcon />
              Commander sur WhatsApp
            </button>
            <p className="mt-4 text-xs leading-5 text-[#615d59]">
              Donnez le prénom de l’enfant et le lieu de livraison.
            </p>
          </div>
        </section>

        <section className="border-t border-[#e6e6e6] px-4 py-16 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <div className="mb-3 text-xs font-extrabold uppercase tracking-normal text-[#0075de]">
                Questions fréquentes
              </div>
              <h2 className="text-[2.1rem] font-extrabold leading-tight tracking-normal md:text-[3.2rem]">
                Avant de commander
              </h2>
            </div>
            <div className="mt-8 grid gap-3">
              {faqs.map((faq, index) => (
                <details
                  key={faq.q}
                  open={index === 0}
                  className="rounded-xl border border-[#e6e6e6] bg-white px-5 py-4 shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-extrabold text-[#111111]">
                    {faq.q}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[#615d59]">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StickyCommanderBar
        onCommander={() => openLeadModal("sticky_bar")}
        shakeStartId="commande"
        label="Commander sur WhatsApp"
        countdownLabel={`Offre de lancement : fin dans ${offerCountdown}`}
        leadingIcon={<WhatsAppIcon />}
      />
      {modalOpen && <WhatsAppLeadModal bd={bd} autoFocus={autoFocusModal} onClose={() => setModalOpen(false)} />}
    </>
  );
}
