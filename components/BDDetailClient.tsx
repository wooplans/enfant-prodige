"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import StickyCommanderBar from "@/components/StickyCommanderBar";
import CheckoutModal from "@/components/CheckoutModal";
import { fbqTrack } from "@/components/FacebookPixel";

interface Props {
  bd: BD;
}

const AVATAR_COLORS = ["#166534", "#15803d", "#14532d"];

export default function BDDetailClient({ bd }: Props) {
  const [modalOuvert, setModalOuvert] = useState(false);
  const [slideActif, setSlideActif] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const slides = bd.galerie.slice(0, 4);
  const slideLabels = ["Couverture", "Aperçu histoire", "Héros", "Détails"];

  const slideSuivant = () => setSlideActif((c) => (c + 1) % slides.length);
  const slidePrecedent = () => setSlideActif((c) => (c - 1 + slides.length) % slides.length);

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

  const ouvrir = () => setModalOuvert(true);

  return (
    <>
      {/* ── HÉRO ── */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.15),transparent_30%),linear-gradient(135deg,rgba(22,101,52,0.95),rgba(6,78,59,0.98))]" />
        <div className="relative max-w-lg mx-auto px-4 pt-5 pb-10">
          {/* Retour */}
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-green-400 hover:text-green-200 text-sm mb-5"
          >
            ← Nos autres BD
          </Link>

          {/* Badge */}
          <div className="text-center mb-5">
            <span className="inline-block border border-amber-400/40 text-amber-300 bg-amber-400/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              📚 BD Personnalisée · Vacances 2026
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-center text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Votre enfant,<br />
            héros de{" "}
            <span className="text-amber-400">{bd.serie}</span>
          </h1>

          {/* Note */}
          {bd.nombreAvis > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stars note={bd.note} />
              <span className="font-bold text-sm">{bd.note}/5</span>
              <span className="text-green-300 text-sm">· +{bd.nombreAvis} avis</span>
            </div>
          )}

          {/* Description */}
          <p className="text-center text-green-100 text-base leading-relaxed mb-6 max-w-sm mx-auto">
            {bd.description}
          </p>

          {/* Carousel */}
          <div
            className="relative w-full h-[280px] sm:h-[360px] rounded-2xl overflow-hidden bg-green-950 shadow-xl mb-6"
            onTouchStart={(e) => setTouchStartX(e.changedTouches[0].clientX)}
            onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
          >
            {slides.map((src, index) => (
              <Image
                key={src}
                src={src}
                alt={`${slideLabels[index]} de ${bd.serie}`}
                fill
                priority={index === 0}
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
              <div className="text-xs font-bold text-white mb-2">{slideLabels[slideActif]}</div>
              <div className="flex gap-1.5">
                {slides.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setSlideActif(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${slideActif === i ? "w-6 bg-amber-400" : "w-1.5 bg-white/50 hover:bg-white"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-green-400/70 line-through text-base">15 000 FCFA</span>
              <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">-34%</span>
            </div>
            <div className="text-5xl font-extrabold text-white leading-none">
              {bd.prix.toLocaleString("fr-FR")}{" "}
              <span className="text-2xl font-bold text-green-300">FCFA</span>
            </div>
          </div>

          {/* CTA principal */}
          <button
            onClick={ouvrir}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-colors mb-3"
          >
            <WhatsAppIcon />
            Commander sur WhatsApp
          </button>

          <p className="text-center text-green-300 text-sm mb-6">
            Paiement Mobile Money · Livraison en 24h à Yaoundé &amp; Douala
          </p>

          {/* Preuve sociale */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {bd.avis.slice(0, 3).map((avis, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-green-900 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: AVATAR_COLORS[i] }}
                >
                  {avis.avatar}
                </div>
              ))}
            </div>
            <span className="text-green-200 text-sm font-semibold">
              Déjà +{bd.nombreCommandesSemaine} commandes cette semaine
            </span>
          </div>
        </div>
      </section>

      {/* ── VACANCES ── */}
      <section className="bg-amber-50 px-4 py-10">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <span className="text-4xl">☀️</span>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-3 leading-tight">
              C&apos;est les vacances...<br />et votre enfant ?
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-6">
            <p className="text-gray-700 leading-relaxed">
              En ce moment au Cameroun, les enfants sont à la maison. Entre les écrans et l&apos;ennui,
              trouver une activité qui <strong>stimule vraiment</strong> votre enfant… c&apos;est un vrai défi.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Et si cette fois, il découvrait un livre où{" "}
              <strong>son prénom est imprimé sur la couverture</strong> ? Une BD où c&apos;est LUI le héros.
              Ils ne la lâchent plus.
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {[
              "Captive l'attention des enfants de 6 à 10 ans",
              "Stimule la lecture pendant les grandes vacances",
              "100% personnalisée avec le prénom de votre enfant",
              "Livraison en 24h à Yaoundé et Douala",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-800 font-medium text-sm">
                <span className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Citation forte */}
          <blockquote className="border-l-4 border-amber-400 pl-4 bg-white rounded-r-xl py-4 pr-4 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed italic">
              «&nbsp;Mon fils de 8 ans a pleuré de joie en voyant son prénom sur la couverture&nbsp;!
              Il a lu le livre 4 fois en une semaine. Un cadeau extraordinaire.&nbsp;»
            </p>
            <footer className="text-xs font-bold text-green-700 mt-2">
              — Cécile M., Yaoundé · ★★★★★ Achat vérifié
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── COMMENT COMMANDER ── */}
      <section className="bg-white px-4 py-10">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
            Commandez en 2 minutes
          </h2>

          <ol className="space-y-6 mb-8">
            {[
              {
                step: "1",
                titre: "Entrez le prénom de votre enfant",
                texte: "Cliquez sur le bouton, renseignez le prénom et le sexe. 30 secondes chrono.",
              },
              {
                step: "2",
                titre: "Recevez votre BD en 24h",
                texte: "Un message pré-rempli s'ouvre sur WhatsApp. Envoyez-le, payez 9 900 FCFA par Mobile Money — votre BD arrive le lendemain.",
              },
            ].map(({ step, titre, texte }) => (
              <li key={step} className="flex gap-4">
                <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">{titre}</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{texte}</p>
                </div>
              </li>
            ))}
          </ol>

          <button
            onClick={ouvrir}
            className="w-full bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-extrabold text-base py-4 rounded-2xl transition-colors"
          >
            Personnaliser maintenant →
          </button>
        </div>
      </section>

      {/* ── AVIS ── */}
      {bd.avis.length > 0 && (
        <section id="avis-parents" className="bg-amber-50 px-4 py-10">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">
                Avis parents · {bd.note}/5
              </h2>
              <Stars note={bd.note} />
            </div>

            <div className="space-y-4">
              {bd.avis.map((avis, i) => (
                <article key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{avis.nom}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {avis.ville} · {avis.date}
                      </span>
                    </div>
                    <Stars note={avis.note} small />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">« {avis.commentaire} »</p>
                  <div className="mt-2 text-xs font-semibold text-green-700">✓ Achat vérifié</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ── */}
      <section className="bg-green-900 text-white px-4 pt-14 pb-28">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-5xl mb-5">🌟</div>
          <h2 className="text-3xl font-extrabold leading-tight mb-4">
            Ces vacances, votre enfant{" "}
            <span className="text-amber-400">mérite d&apos;être le héros.</span>
          </h2>
          <p className="text-green-200 text-base leading-relaxed mb-8">
            {bd.nombreCommandesSemaine} familles ont déjà commandé cette semaine.
            Livraison garantie en 24h à Yaoundé et Douala.
          </p>

          <button
            onClick={ouvrir}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-extrabold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-colors mb-4"
          >
            <WhatsAppIcon />
            Commander sur WhatsApp
          </button>

          <p className="text-green-400 text-sm">
            Paiement Mobile Money · Livraison en 24h
          </p>
        </div>
      </section>

      <StickyCommanderBar onCommander={ouvrir} shakeStartId="avis-parents" />
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
