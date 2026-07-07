"use client";

import { useEffect, useRef, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { WHATSAPP_NUMBER } from "@/lib/catalogue";
import { trackWhatsAppOrder } from "@/lib/whatsapp-order-tracking";

interface Props {
  bd: BD;
  onClose: () => void;
  autoFocus?: boolean;
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

const DELIVERY_FEE = 1000;

const deliveryOptions = [
  "Yaoundé (Livraison)",
  "Douala (Expédition)",
  "Autre ville (Expédition)",
] as const;

function formatFcfa(value: number) {
  return `${value.toLocaleString("fr-FR").replace(/\s/g, ".")} FCFA`;
}

export default function WhatsAppLeadModal({ bd, onClose, autoFocus = false }: Props) {
  const [prenom, setPrenom] = useState("");
  const [sexe, setSexe] = useState<"Garçon" | "Fille" | null>(null);
  const [ville, setVille] = useState<(typeof deliveryOptions)[number] | null>(null);
  const [touched, setTouched] = useState({
    prenom: false,
    sexe: false,
    ville: false,
  });
  const prenomInputRef = useRef<HTMLInputElement | null>(null);

  const prenomValide = prenom.trim().length >= 2;
  const sexeValide = sexe === "Garçon" || sexe === "Fille";
  const villeValide = ville !== null;
  const isValid = prenomValide && sexeValide && villeValide;
  const total = bd.prix + DELIVERY_FEE;
  const isMetiersLanding = bd.id === "decouvre-les-metiers";
  const productLabel = `BD ${bd.serie}`;
  const modalDescription = isMetiersLanding
    ? "Remplissez les informations."
    : "Trois informations suffisent pour préparer votre demande.";
  const priceBoxDescription = isMetiersLanding
    ? `BD personnalisée sur les métiers + livraison / expédition à ${formatFcfa(DELIVERY_FEE)}.`
    : `BD personnalisée + livraison / expédition à ${formatFcfa(DELIVERY_FEE)}.`;
  const trackingSource = isMetiersLanding ? "decouvre_metiers_modal" : "sauve_animaux_modal";

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (!autoFocus) return;
    prenomInputRef.current?.focus();
  }, [autoFocus]);

  const submit = () => {
    setTouched({ prenom: true, sexe: true, ville: true });
    if (!isValid || !sexe || !ville) return;

    const message = [
      "Salut ! Je souhaite commander une BD personnalisée :",
      `${productLabel} : ${formatFcfa(bd.prix)}`,
      `Prénom : ${prenom.trim()}`,
      `Sexe : ${sexe}`,
      `${ville} : ${DELIVERY_FEE} FCFA`,
      `Total à payer : ${formatFcfa(total)}`,
    ].join("\n");

    void trackWhatsAppOrder({
      seriesId: bd.id,
      seriesSlug: bd.slug,
      seriesTitle: bd.serie,
      prenom,
      lieuLivraison: ville,
      prix: bd.prix,
      source: trackingSource,
    });

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-0 md:items-center md:px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[#e6e6e6] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e6e6e6] bg-white px-5 py-4">
          <div>
            <div className="inline-flex rounded-full bg-[#0075de]/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-normal text-[#0075de]">
              Offre limitée
            </div>
            <div className="mt-2 text-xl font-extrabold leading-tight text-[#111111]">
              Commander sur WhatsApp
            </div>
            <p className="mt-1 text-sm leading-5 text-[#615d59]">{modalDescription}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e6e6e6] bg-[#f6f5f4] text-lg font-bold text-[#615d59] transition-colors hover:bg-white hover:text-[#111111]"
            aria-label="Fermer"
          >
              x
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6 pt-5">
          <div className="rounded-xl border border-[#e6e6e6] bg-[#f6f5f4] px-4 py-3 text-left">
            <div className="text-xs font-bold uppercase tracking-normal text-[#615d59]">
              Total à payer
            </div>
            <div className="mt-1 text-2xl font-extrabold text-[#0075de]">
              {formatFcfa(total)}
            </div>
            <p className="mt-1 text-xs leading-5 text-[#615d59]">{priceBoxDescription}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-normal text-[#615d59]">
              Prénom <span className="text-[#dd5b00]">*</span>
            </label>
            <input
              ref={prenomInputRef}
              type="text"
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, prenom: true }))}
              placeholder="Ex : Kylian"
              className={`w-full rounded-lg border px-4 py-3 text-base text-[#111111] outline-none transition-colors focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/15 ${
                touched.prenom && !prenomValide ? "border-[#dd5b00] bg-[#dd5b00]/5" : "border-[#e6e6e6] bg-white"
              }`}
            />
            {touched.prenom && !prenomValide && (
              <p className="mt-1 text-sm text-[#dd5b00]">Veuillez entrer au moins 2 caractères.</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-normal text-[#615d59]">
              Sexe <span className="text-[#dd5b00]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["Garçon", "Fille"] as const).map((option) => {
                const active = sexe === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSexe(option);
                      setTouched((current) => ({ ...current, sexe: true }));
                    }}
                    className={`rounded-lg border px-4 py-3 text-sm font-extrabold transition-colors ${
                      active
                        ? "border-[#0075de] bg-[#0075de]/10 text-[#0075de]"
                        : "border-[#e6e6e6] bg-white text-[#111111] hover:border-[#0075de]/40"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {touched.sexe && !sexeValide && (
              <p className="mt-1 text-sm text-[#dd5b00]">Veuillez choisir une option.</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-normal text-[#615d59]">
              Livraison / expédition : {formatFcfa(DELIVERY_FEE)}{" "}
              <span className="text-[#dd5b00]">*</span>
            </label>
            <select
              value={ville ?? ""}
              onChange={(event) => {
                setVille(event.target.value as (typeof deliveryOptions)[number]);
                setTouched((current) => ({ ...current, ville: true }));
              }}
              onBlur={() => setTouched((current) => ({ ...current, ville: true }))}
              className={`w-full rounded-lg border bg-white px-4 py-3 text-base font-extrabold text-[#111111] outline-none transition-colors focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/15 ${
                touched.ville && !villeValide ? "border-[#dd5b00] bg-[#dd5b00]/5" : "border-[#e6e6e6]"
              }`}
            >
              <option value="" disabled>
                Choisissez une option
              </option>
              {deliveryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {touched.ville && !villeValide && (
              <p className="mt-1 text-sm text-[#dd5b00]">Veuillez choisir une option.</p>
            )}
          </div>

          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0075de] px-5 py-4 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(0,117,222,0.22)] transition-colors hover:bg-[#005bab]"
          >
            <WhatsAppIcon />
            Envoyez ma commande
          </button>
          <p className="text-center text-xs leading-5 text-[#615d59]">
            WhatsApp va s’ouvrir avec votre demande déjà prête.
          </p>
        </div>
      </div>
    </div>
  );
}
