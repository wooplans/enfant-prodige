"use client";

import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { WHATSAPP_NUMBER } from "@/lib/catalogue";
import { trackWhatsAppOrder } from "@/lib/whatsapp-order-tracking";

interface Props {
  bd: BD;
  onClose: () => void;
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

export default function WhatsAppLeadModal({ bd, onClose }: Props) {
  const [prenom, setPrenom] = useState("");
  const [sexe, setSexe] = useState<"Garçon" | "Fille" | null>(null);
  const [ville, setVille] = useState<(typeof deliveryOptions)[number] | null>(null);
  const [touched, setTouched] = useState({
    prenom: false,
    sexe: false,
    ville: false,
  });

  const prenomValide = prenom.trim().length >= 2;
  const sexeValide = sexe === "Garçon" || sexe === "Fille";
  const villeValide = ville !== null;
  const isValid = prenomValide && sexeValide && villeValide;
  const total = bd.prix + DELIVERY_FEE;

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

  const submit = () => {
    setTouched({ prenom: true, sexe: true, ville: true });
    if (!isValid || !sexe || !ville) return;

    const message = [
      "Salut ! Je souhaite commander une BD personnalisee :",
      `BD Sauve les Animaux : ${formatFcfa(bd.prix)}`,
      `Prenom : ${prenom.trim()}`,
      `Sexe : ${sexe}`,
      `${ville} : ${DELIVERY_FEE} FCFA`,
      `Total à payer: ${formatFcfa(total)}`,
    ].join("\n");

    void trackWhatsAppOrder({
      seriesId: bd.id,
      seriesSlug: bd.slug,
      seriesTitle: bd.serie,
      prenom,
      lieuLivraison: ville,
      prix: bd.prix,
      source: "sauve_animaux_modal",
    });

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl md:rounded-[2rem]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-100 bg-white px-5 py-4">
          <div>
            <div className="text-sm font-extrabold text-emerald-900">Commander sur WhatsApp</div>
            <div className="text-sm text-gray-600">
              Quelques informations pour préparer votre demande
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6 pt-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="font-extrabold">Total à payer : {formatFcfa(total)}</div>
            <div className="mt-1">Frais de livraison/Expédition inclus !</div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, prenom: true }))}
              placeholder="Ex : Kylian"
              className={`w-full rounded-2xl border px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-emerald-500 ${
                touched.prenom && !prenomValide ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              }`}
            />
            {touched.prenom && !prenomValide && (
              <p className="mt-1 text-sm text-red-600">Veuillez entrer au moins 2 caractères.</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Sexe <span className="text-red-500">*</span>
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
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${
                      active
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {touched.sexe && !sexeValide && (
              <p className="mt-1 text-sm text-red-600">Veuillez choisir une option.</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Livraison / Expédition : 1000 FCFA <span className="text-red-500">*</span>
            </label>
            <div className="grid gap-3">
              {deliveryOptions.map((option) => {
                const active = ville === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setVille(option);
                      setTouched((current) => ({ ...current, ville: true }));
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                      active
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {touched.ville && !villeValide && (
              <p className="mt-1 text-sm text-red-600">Veuillez choisir une option.</p>
            )}
          </div>

          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-white shadow-lg transition-colors hover:bg-[#1ebe5d]"
          >
            Commander sur WhatsApp <span aria-hidden="true">-&gt;</span>
          </button>
          <p className="text-center text-xs leading-5 text-gray-500">
            WhatsApp va s’ouvrir avec votre demande déjà prête.
          </p>
        </div>
      </div>
    </div>
  );
}
