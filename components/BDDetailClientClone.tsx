"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { fbqTrack, fbqTrackCustom } from "@/components/FacebookPixel";
import { trackWhatsAppOrderServer } from "@/app/actions/pixel";

interface Props {
  bd: BD;
  autresSeries: BD[];
}

export default function BDDetailClientClone({ bd }: Props) {
  // --- Urgency Timer State ---
  const [timeLeft, setTimeLeft] = useState(86400);

  useEffect(() => {
    const STORAGE_KEY = "sauve_animaux_clone_timer_target";
    let targetTime = localStorage.getItem(STORAGE_KEY);
    
    if (!targetTime) {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      targetTime = String(now + twentyFourHours);
      localStorage.setItem(STORAGE_KEY, targetTime);
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((Number(targetTime) - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        const newTarget = String(Date.now() + 24 * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_KEY, newTarget);
        setTimeLeft(24 * 60 * 60);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // --- Form & Booking States ---
  const [data, setData] = useState({
    prenom: "",
    sexe: null as "Garçon" | "Fille" | null,
    trancheAge: "",
    langue: "Français",
    lieuLivraison: "",
  });
  const [prenomTouche, setPrenomTouche] = useState(false);
  const [trancheAgeTouche, setTrancheAgeTouche] = useState(false);
  const [lieuLivraisonTouche, setLieuLivraisonTouche] = useState(false);
  const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);

  // --- Slider States ---
  const [slideActif, setSlideActif] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const slides = bd.galerie.slice(0, 4);
  const slideLabels = ["Patricia", "Jean-Jacques", "Famille"];

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

  // --- Tracking Page View ---
  useEffect(() => {
    fbqTrack("ViewContent", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
  }, [bd.id, bd.prix, bd.serie]);

  // --- Track Form Interactions ---
  const handleFormInteraction = () => {
    if (!hasInitiatedCheckout) {
      setHasInitiatedCheckout(true);
      fbqTrack("InitiateCheckout", {
        content_name: bd.serie,
        content_ids: [bd.id],
        content_type: "product",
        value: bd.prix,
        currency: "XAF",
      });
    }
  };

  // --- Validation Helpers ---
  const prenomValide = data.prenom.trim().length >= 2;
  const sexeValide = data.sexe !== null;
  const trancheAgeValide = data.trancheAge !== "";
  const lieuLivraisonValide = data.lieuLivraison !== "";
  const formValide = prenomValide && sexeValide && trancheAgeValide && lieuLivraisonValide;

  // --- Pre-filled message generator ---
  const whatsappUrl = (() => {
    const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "237680589708";

    const message = [
      `Bonjour ! Je souhaite commander une BD personnalisée :`,
      ``,
      `📚 *${bd.serie}*`,
      ``,
      `👶 Prénom de l'enfant : ${data.prenom} ( ${data.sexe} )`,
      `🎂 Tranche d'âge : ${data.trancheAge}`,
      `🌍 Langue de la BD : ${data.langue}`,
      ``,
      `📍 Option de Livraison/Expédition : ${data.lieuLivraison}`,
      ``,
      `💰 Montant de la BD : ${bd.prix.toLocaleString("fr-FR")} FCFA ✅`,
      `📦 Frais de livraison : ${bd.fraisLivraison.toLocaleString("fr-FR")} FCFA`,
      `💵 Total à payer : ${(bd.prix + bd.fraisLivraison).toLocaleString("fr-FR")} FCFA`,
      ``,
      `Merci de me confirmer les détails de la commande.`,
    ].join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  })();

  // --- Handle Final CTA WhatsApp Click ---
  const handleWhatsAppClick = async () => {
    if (!formValide) return;

    // Track Lead on conversion success
    fbqTrack("Lead", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });

    // Browser custom event CommandeWhatsApp
    fbqTrackCustom("CommandeWhatsApp", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
      langue: data.langue,
      trancheAge: data.trancheAge,
      lieuLivraison: data.lieuLivraison,
    });

    // Server-side CAPI event track
    try {
      await trackWhatsAppOrderServer({
        prenom: data.prenom,
        sexe: data.sexe,
        trancheAge: data.trancheAge,
        langue: data.langue,
        lieuLivraison: data.lieuLivraison,
        quartier: data.lieuLivraison,
        rue: "",
        prix: bd.prix,
        serie: bd.serie,
        id: bd.id,
      });
    } catch (e) {
      console.error("CAPI trigger error:", e);
    }

    // Go to WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. Urgency Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-[11px] sm:text-xs py-2 px-2 sticky top-0 z-50 shadow-md text-center flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden">
        <span>⚡ Offre : <span className="line-through opacity-85">20 000</span> <span className="bg-yellow-300 text-red-700 px-1 py-0.5 rounded text-[10px] sm:text-xs">9 900 FCFA</span></span>
        <span className="opacity-40">|</span>
        <span>Finit dans : <span className="font-mono bg-black/35 px-1.5 py-0.5 rounded text-white tracking-wider font-semibold animate-pulse">{formatTime(timeLeft)}</span></span>
      </div>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">

        {/* 3. Previews / Carousel */}
        <section 
          className="relative w-full aspect-video overflow-hidden bg-slate-200 rounded-3xl border border-slate-200 shadow-xl"
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
              sizes="(max-width: 600px) 100vw, 576px"
              className={`object-cover transition-opacity duration-500 ${slideActif === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          
          <button
            onClick={slidePrecedent}
            aria-label="Image précédente"
            className="absolute left-3 top-1/2 z-10 w-9 h-9 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-md backdrop-blur-xs font-bold transition-all"
          >
            ←
          </button>
          <button
            onClick={slideSuivant}
            aria-label="Image suivante"
            className="absolute right-3 top-1/2 z-10 w-9 h-9 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-md backdrop-blur-xs font-bold transition-all"
          >
            →
          </button>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col gap-1.5">
            <span className="text-white text-xs font-bold tracking-wide">{slideLabels[slideActif]}</span>
            <div className="flex gap-1.5">
              {slides.map((src, index) => (
                <button
                  key={src}
                  onClick={() => setSlideActif(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${slideActif === index ? "w-6 bg-yellow-400" : "w-1.5 bg-white/45"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Direct Form & CTA */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-5 sm:p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
              <span>✍️</span> Personnaliser ma commande
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Remplissez les détails ci-dessous pour générer votre commande instantanée.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            
            {/* Prénom */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Prénom de l&apos;enfant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.prenom}
                onFocus={handleFormInteraction}
                onChange={(e) => {
                  handleFormInteraction();
                  setData({ ...data, prenom: e.target.value });
                }}
                onBlur={() => setPrenomTouche(true)}
                placeholder="Ex : Kylian, Amina, Kofi..."
                maxLength={30}
                className={`w-full border rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-sm ${
                  prenomTouche && !prenomValide ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
                }`}
              />
              {prenomTouche && !prenomValide && (
                <span className="text-xs text-red-500 font-semibold">Le prénom est requis (au moins 2 lettres)</span>
              )}
            </div>

            {/* Sexe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sexe de l&apos;enfant <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(["Garçon", "Fille"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      handleFormInteraction();
                      setData({ ...data, sexe: s });
                    }}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                      data.sexe === s
                        ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {s === "Garçon" ? "👦 Garçon" : "👧 Fille"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tranche d'âge Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tranche d&apos;âge <span className="text-red-500">*</span>
              </label>
              <select
                value={data.trancheAge}
                onFocus={handleFormInteraction}
                onChange={(e) => {
                  handleFormInteraction();
                  setData({ ...data, trancheAge: e.target.value });
                }}
                onBlur={() => setTrancheAgeTouche(true)}
                className={`w-full border rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm ${
                  trancheAgeTouche && !trancheAgeValide ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
              >
                <option value="" disabled>Choississez une option</option>
                <option value="3-5 ans">3-5 ans</option>
                <option value="6-8 ans">6-8 ans</option>
                <option value="9-12 ans">9-12 ans</option>
              </select>
              {trancheAgeTouche && !trancheAgeValide && (
                <span className="text-xs text-red-500 font-semibold">Veuillez choisir la tranche d&apos;âge</span>
              )}
            </div>

            {/* Langue Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Langue de la bande dessinée <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(["Français", "Anglais"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      handleFormInteraction();
                      setData({ ...data, langue: l });
                    }}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                      data.langue === l
                        ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {l === "Français" ? "🇫🇷 Français" : "🇬🇧 Anglais"}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery/Shipping location Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                LIVRAISON / EXPÉDITION : 1.000 FCFA <span className="text-red-500">*</span>
              </label>
              <select
                value={data.lieuLivraison}
                onFocus={handleFormInteraction}
                onChange={(e) => {
                  handleFormInteraction();
                  setData({ ...data, lieuLivraison: e.target.value });
                }}
                onBlur={() => setLieuLivraisonTouche(true)}
                className={`w-full border rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white text-sm ${
                  lieuLivraisonTouche && !lieuLivraisonValide ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
              >
                <option value="" disabled>Choisissez une option</option>
                <option value="Yaoundé (Livraison)">Yaoundé (Livraison)</option>
                <option value="Douala (Expédition)">Douala (Expédition)</option>
                <option value="Autre ville (Expédition)">Autre ville (Expédition)</option>
              </select>
              {lieuLivraisonTouche && !lieuLivraisonValide && (
                <span className="text-xs text-red-500 font-semibold">Veuillez choisir une option de livraison/expédition</span>
              )}
            </div>



            {/* Summary Price Card */}
            <div className="mt-3 bg-green-50/70 border border-green-100 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">💸 Prix promo de la BD :</span>
                <span className="text-sm font-extrabold text-slate-900">{bd.prix.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>📦 Frais de livraison :</span>
                <span className="font-semibold text-slate-800">+{bd.fraisLivraison.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <hr className="border-green-200/60 my-1" />
              <div className="flex justify-between items-center font-black text-green-950 text-sm sm:text-base">
                <span>Total à payer :</span>
                <span>{(bd.prix + bd.fraisLivraison).toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>

            {/* WhatsApp submit CTA */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              disabled={!formValide}
              className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98 ${
                formValide
                  ? "bg-green-600 hover:bg-green-500 cursor-pointer animate-pulse hover:animate-none"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {formValide ? "Commander via WhatsApp" : "Remplissez le formulaire pour commander"}
            </button>
          </form>

        </section>

      </main>
    </div>
  );
}
