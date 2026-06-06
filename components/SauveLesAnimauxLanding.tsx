"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import WhatsAppLeadModal from "@/components/WhatsAppLeadModal";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

interface Props {
  bd: BD;
}

const heroCover = "/sauve-les-animaux/cover-girl.jpeg";
const alternateCover = "/sauve-les-animaux/cover-boy.jpeg";
const familyReading = "/sauve-les-animaux/family-reading.png";

const heroSlides = [
  {
    src: heroCover,
    title: "La couverture personnalisee",
    text: "Son prenom apparait des la premiere page.",
  },
  {
    src: alternateCover,
    title: "L'enfant au centre de l'histoire",
    text: "Il ne regarde pas l'aventure, il la vit.",
  },
  {
    src: familyReading,
    title: "Un vrai moment de lecture",
    text: "Une histoire qui se partage avec fierte et emotion.",
  },
];

const reassuranceItems = [
  "Le prenom de votre enfant apparait dans l'histoire",
  "Commande simple sur WhatsApp",
  "BD physique en couleur",
  "Livraison organisee avec vous",
];

const experienceItems = [
  "Votre enfant devient le heros de l'aventure.",
  "Il aide les animaux et avance dans une vraie mission.",
  "Il retrouve son prenom dans la BD et se sent vraiment au centre de l'histoire.",
];

const parentBenefits = [
  "Un cadeau original qui marque plus qu'un jouet de plus.",
  "Une belle facon de lui donner envie de lire.",
  "Une commande rapide, simple, et sans parcours compliqué.",
];

const faqs = [
  {
    q: "Comment se passe la commande ?",
    a: "Vous indiquez le prenom, le sexe et la ville de livraison, puis WhatsApp s'ouvre avec votre demande deja prete.",
  },
  {
    q: "Est-ce qu'on paye sur le site ?",
    a: "Non. Cette page sert simplement a lancer votre demande sur WhatsApp.",
  },
  {
    q: "Le prenom apparait vraiment dans la BD ?",
    a: "Oui. Le prenom de votre enfant est integre dans l'histoire pour rendre le livre vraiment personnel.",
  },
  {
    q: "Quelles informations faut-il donner ?",
    a: "Seulement le prenom, le sexe et la ville de livraison.",
  },
];

export default function SauveLesAnimauxLanding({ bd }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const openLeadModal = (source: string) => {
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
    const intervalId = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentHeroSlide = heroSlides[heroSlideIndex];

  return (
    <>
      <main className="bg-[#f7f1e3] pb-28 text-gray-950">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#184e3b_0%,#103c2f_55%,#0d2d24_100%)] text-white min-h-screen">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_26%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(74,222,128,0.18),transparent_25%)]" />
          <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-4 py-5 md:px-6 md:py-8">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-amber-200">
                BD personnalisee pour enfant
              </div>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
                Et si votre enfant devenait le petit heros qui sauve les animaux ?
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base md:text-lg">
                Son prenom apparait dans la BD. Un cadeau tendre, original et memorable.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-emerald-50 sm:text-sm">
                <span className="rounded-full bg-white/10 px-4 py-2">6 a 10 ans</span>
                <span className="rounded-full bg-white/10 px-4 py-2">32 pages couleur</span>
                <span className="rounded-full bg-white/10 px-4 py-2">Commande sur WhatsApp</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-emerald-950 shadow-2xl">
                <Image
                  src={currentHeroSlide.src}
                  alt={currentHeroSlide.title}
                  width={900}
                  height={1000}
                  priority
                  className="h-[34vh] w-full object-cover sm:h-[38vh] md:h-[42vh] lg:h-[520px]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-4 pb-4 pt-10">
                  <div className="text-sm font-extrabold text-white">{currentHeroSlide.title}</div>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-emerald-50 sm:text-sm">
                    {currentHeroSlide.text}
                  </p>
                </div>
              </div>
            </div>
            </div>

            <div className="pb-2 pt-4">
              <div className="flex items-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setHeroSlideIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${heroSlideIndex === index ? "w-8 bg-amber-300" : "w-2.5 bg-white/45"}`}
                    aria-label={`Voir ${slide.title}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => openLeadModal("hero")}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-white shadow-lg transition-colors hover:bg-[#1ebe5d] sm:w-auto"
              >
                Commander sur WhatsApp <span aria-hidden="true">-&gt;</span>
              </button>

              <p className="mt-3 text-sm font-semibold text-emerald-50">
                Commande simple • Prenom personnalise • Ville de livraison en 30 secondes
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
          <div className="grid gap-4 md:grid-cols-4">
            {reassuranceItems.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-emerald-100 bg-white px-5 py-5 shadow-sm">
                <div className="text-sm font-extrabold text-emerald-800">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <div className="mb-4 h-1.5 w-16 rounded-full bg-emerald-700" />
              <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
                Ce que votre enfant va vivre
              </h2>
              <div className="mt-6 space-y-4">
                {experienceItems.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-emerald-100 bg-[#f6fff8] px-5 py-4 text-sm leading-7 text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openLeadModal("experience_section")}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-extrabold text-white shadow-lg transition-colors hover:bg-[#1ebe5d]"
              >
                Commander sur WhatsApp <span aria-hidden="true">-&gt;</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-[#f6fff8] shadow-sm sm:col-span-2">
                <Image src={alternateCover} alt="Exemple de couverture personnalisee garcon" width={900} height={700} className="h-full w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-[#f6fff8] shadow-sm sm:col-span-2">
                <Image src={familyReading} alt="Parent et enfant lisant ensemble la bande dessinee" width={900} height={1300} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#fff4c7_0%,#fff8df_45%,#ffffff_100%)] p-6 md:p-9">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-amber-400" />
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Comment commander</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["1", "Vous remplissez 3 champs", "Prenom, sexe et ville de livraison."],
                ["2", "WhatsApp s'ouvre", "Votre demande part avec les informations deja remplies."],
                ["3", "Vous continuez la conversation", "La suite de la commande se fait directement sur WhatsApp."],
              ].map(([step, title, text]) => (
                <div key={step} className="rounded-[1.5rem] bg-white px-5 py-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-extrabold text-white">{step}</div>
                  <h3 className="mt-4 text-lg font-extrabold text-gray-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <div className="mb-4 h-1.5 w-16 rounded-full bg-emerald-700" />
              <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Pourquoi les parents aiment cette BD</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
              <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
                {parentBenefits.map((item) => (
                  <div key={item} className="rounded-[1.75rem] border border-emerald-100 bg-[#f8fffa] px-5 py-5 shadow-sm">
                    <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-700">Pour vous</div>
                    <p className="mt-3 text-sm leading-7 text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-[#f6fff8] shadow-sm">
                <Image src={familyReading} alt="Moment de lecture entre une maman et son enfant" width={900} height={1300} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="avis-parents" className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <div className="mb-10">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-emerald-700" />
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Des parents ont deja adore</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {bd.avis.map((avis) => (
              <article key={`${avis.nom}-${avis.date}`} className="rounded-[1.75rem] border border-emerald-100 bg-white px-5 py-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-extrabold text-gray-950">{avis.nom}</div>
                    <div className="text-sm text-gray-500">{avis.ville} · {avis.date}</div>
                  </div>
                  <div className="text-sm font-extrabold text-amber-500">{avis.note}/5</div>
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-700">« {avis.commentaire} »</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-emerald-100 bg-[#f6fff8] p-6 md:p-8">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-emerald-700" />
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Livraison et disponibilite</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-700 md:text-lg">
              Vous indiquez simplement votre ville dans le formulaire, puis nous poursuivons avec vous
              directement sur WhatsApp pour la suite de la commande.
            </p>
            <button
              type="button"
              onClick={() => openLeadModal("availability_section")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-extrabold text-white shadow-lg transition-colors hover:bg-[#1ebe5d]"
            >
              Commander sur WhatsApp <span aria-hidden="true">-&gt;</span>
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <div className="mb-10">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-emerald-700" />
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">Questions frequentes</h2>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="rounded-[1.5rem] border border-emerald-100 bg-white px-5 py-4 shadow-sm">
                <summary className="cursor-pointer list-none text-base font-extrabold text-gray-950">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-gray-700">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-emerald-950 px-4 py-14 text-white md:px-6 md:py-18">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
              Offrez-lui une histoire dont il devient le heros
            </h2>
            <p className="mt-4 text-base leading-8 text-emerald-50 md:text-lg">
              Laissez ses informations, ouvrez WhatsApp et lancez votre demande en quelques secondes.
            </p>
            <button
              type="button"
              onClick={() => openLeadModal("final_cta")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-8 py-4 text-base font-extrabold text-white shadow-lg transition-colors hover:bg-[#1ebe5d]"
            >
              Commander sur WhatsApp <span aria-hidden="true">-&gt;</span>
            </button>
          </div>
        </section>
      </main>

      <StickyCommanderBar onCommander={() => openLeadModal("sticky_bar")} shakeStartId="avis-parents" label="Commander sur WhatsApp" />
      {modalOpen && <WhatsAppLeadModal bd={bd} onClose={() => setModalOpen(false)} />}
    </>
  );
}
