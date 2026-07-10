"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { fbqTrack, fbqTrackCustom } from "@/components/FacebookPixel";
import { trackWhatsAppOrderServer } from "@/app/actions/pixel";
import FaqAccordion from "@/components/FaqAccordion";

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
  const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. Urgency Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-[11px] sm:text-xs py-2 px-2 sticky top-0 z-50 shadow-md text-center flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden">
        <span>⚡ Offre : <span className="line-through opacity-85">20 000</span> <span className="bg-yellow-300 text-red-700 px-1 py-0.5 rounded text-[10px] sm:text-xs">9 900 FCFA</span></span>
        <span className="opacity-40">|</span>
        <span>Finit dans : <span className="font-mono bg-black/35 px-1.5 py-0.5 rounded text-white tracking-wider font-semibold animate-pulse">{formatTime(timeLeft)}</span></span>
      </div>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">

        {/* 2. Book Header Info */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest bg-green-50 w-fit px-2.5 py-1 rounded-full border border-green-100">
            {bd.genre}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {bd.serie}
          </h1>
          <div className="flex items-center gap-2">
            <Stars note={bd.note} />
            <span className="text-xs font-bold text-slate-600">
              {bd.note}/5 ({bd.nombreAvis} avis parents)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
            {bd.description}
          </p>
        </div>

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

        {/* 4. How it works */}
        <section className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-5 shadow-xs">
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span>⚙️</span> Comment ça marche ?
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">1</div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight">Je personnalise</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">2</div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight">Je valide sur WhatsApp</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">3</div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight">Livraison sous 24h</span>
            </div>
          </div>
        </section>

        {/* 5. Direct Form & CTA */}
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

            {/* Tranche d'âge Button Group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tranche d&apos;âge <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {["3-5 ans", "6-8 ans", "9-12 ans"].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => {
                      handleFormInteraction();
                      setData({ ...data, trancheAge: age });
                    }}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center ${
                      data.trancheAge === age
                        ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
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

            {/* Delivery/Shipping location Button Group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                LIVRAISON / EXPÉDITION : 1.000 FCFA <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "Yaoundé (Livraison)", label: "Yaoundé (Livraison)" },
                  { value: "Douala (Expédition)", label: "Douala (Expédition)" },
                  { value: "Autre ville (Expédition)", label: "Autre ville (Expédition)" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      handleFormInteraction();
                      setData({ ...data, lieuLivraison: item.value });
                    }}
                    className={`w-full py-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-start px-4 gap-2.5 ${
                      data.lieuLivraison === item.value
                        ? "border-green-600 bg-green-50 text-green-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      data.lieuLivraison === item.value ? "border-green-600 bg-green-600" : "border-slate-300 bg-white"
                    }`}>
                      {data.lieuLivraison === item.value && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
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
            <a
              href={formValide ? whatsappUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!formValide) {
                  e.preventDefault();
                  return;
                }

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

                // Server-side CAPI event track (fire-and-forget in background)
                trackWhatsAppOrderServer({
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
                }).catch((err) => {
                  console.error("CAPI trigger error:", err);
                });
              }}
              className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98 text-center ${
                formValide
                  ? "bg-green-600 hover:bg-green-500 cursor-pointer animate-pulse hover:animate-none"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none shadow-none"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {formValide ? "Commander via WhatsApp" : "Remplissez le formulaire pour commander"}
            </a>
          </form>
        </section>

        {/* 6. Trust Badges */}
        <div className="grid grid-cols-3 gap-2 py-3 text-center border-y border-slate-200/60">
          {[
            { icon: "📱", label: "WhatsApp Direct" },
            { icon: "💳", label: "Mobile Money" },
            { icon: "🚀", label: "Livré sous 24h" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 7. Collapsible Long Description */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="w-full flex items-center justify-between font-extrabold text-slate-800 text-sm uppercase tracking-wider text-left focus:outline-none"
          >
            <span className="flex items-center gap-2">📖 À propos de cette aventure</span>
            <span className="text-green-600 text-xs font-bold transition-transform duration-200">{descExpanded ? "▲ Masquer" : "▼ En savoir plus"}</span>
          </button>
          
          {descExpanded && (
            <div className="mt-5 flex flex-col gap-5 text-slate-700 border-t border-slate-100 pt-4 animate-fadeIn">
              
              <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-600">
                Dans ce grand livre d&apos;aventures sur mesure, votre enfant est le héros qui parcourt l&apos;Afrique pour protéger la faune sauvage !
              </p>

              {/* 3 Main Features */}
              <div className="grid grid-cols-1 gap-3.5">
                {[
                  {
                    icon: "📚",
                    title: "Histoires personnalisées",
                    desc: "Le prénom de l'enfant est imprimé sur la couverture et intégré au cœur de chaque récit.",
                  },
                  {
                    icon: "🧠",
                    title: "15 Fiches éducatives",
                    desc: "Des fiches documentaires ('À retenir sur...') pour apprendre le mode de vie et les secrets de chaque espèce.",
                  },
                  {
                    icon: "🎨",
                    title: "15 Pages de coloriages",
                    desc: "Un espace créatif de coloriage après chaque aventure pour s'amuser et s'approprier l'histoire.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-xs">{item.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Animal Grid */}
              <div className="flex flex-col gap-2">
                <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
                  Quelques animaux à secourir dans le livre :
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "🐘 Tembo l'éléphant",
                    "🦁 Simba le lionceau",
                    "🦒 Zara la girafe",
                    "🦍 Kongo le gorille",
                    "🐢 Kélé la tortue",
                    "🦜 Koko le perroquet",
                    "🦏 Rino le rhinocéros",
                    "🐗 Pumba le phacochère",
                    "🐆 Kipo le guépard",
                    "🦎 Léo le caméléon",
                  ].map((animal) => (
                    <span
                      key={animal}
                      className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-xl border border-green-100"
                    >
                      {animal}
                    </span>
                  ))}
                  <span className="text-xs bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-xl border border-slate-100 italic">
                    + 5 autres animaux !
                  </span>
                </div>
              </div>

              {/* Book Details Footer */}
              <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span>📄 Format A4</span>
                <span className="text-slate-300">|</span>
                <span>📖 62 pages</span>
                <span className="text-slate-300">|</span>
                <span>🎨 Coloriage inclus</span>
              </div>

            </div>
          )}
        </section>

        {/* 8. Avis Parents (Reviews) */}
        {bd.avis.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                ⭐ Avis parents ({bd.nombreAvis})
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-green-950 text-sm">{bd.note}/5</span>
                <Stars note={bd.note} small />
              </div>
            </div>

            <div className="flex flex-col gap-4 divide-y divide-slate-100">
              {bd.avis.map((avis, i) => (
                <div key={i} className={`flex flex-col gap-1.5 ${i > 0 ? "pt-4" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900">{avis.nom}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-medium">{avis.ville} · {avis.date}</span>
                    </div>
                    <Stars note={avis.note} small />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    « {avis.commentaire} »
                  </p>
                  <span className="text-[10px] text-green-700 font-extrabold flex items-center gap-1">
                    ✓ Achat vérifié
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. FAQ Accordion */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4">
            ❓ Questions fréquentes
          </h3>
          <FaqAccordion />
        </section>

      </main>
    </div>
  );
}

// --- Local Helpers copied from BDDetailClient.tsx ---

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
