"use client";

import { useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { WHATSAPP_NUMBER } from "@/lib/catalogue";
import { trackWhatsAppOrder } from "@/lib/whatsapp-order-tracking";

interface Props {
  bd: BD;
  onClose: () => void;
}

export default function WhatsAppLeadModal({ bd, onClose }: Props) {
  const [prenom, setPrenom] = useState("");
  const [sexe, setSexe] = useState<"Garçon" | "Fille" | null>(null);
  const [ville, setVille] = useState("");
  const [touched, setTouched] = useState({
    prenom: false,
    sexe: false,
    ville: false,
  });

  const prenomValide = prenom.trim().length >= 2;
  const sexeValide = sexe === "Garçon" || sexe === "Fille";
  const villeValide = ville.trim().length >= 2;
  const isValid = prenomValide && sexeValide && villeValide;

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
    if (!isValid || !sexe) return;

    const message = [
      "Bonjour ! Je souhaite commander une BD personnalisee :",
      "",
      `📚 ${bd.serie}`,
      `👶 Prenom : ${prenom.trim()}`,
      `🧒 Sexe : ${sexe}`,
      `📍 Ville de livraison / expedition : ${ville.trim()}`,
    ].join("\n");

    void trackWhatsAppOrder({
      seriesId: bd.id,
      seriesSlug: bd.slug,
      seriesTitle: bd.serie,
      prenom,
      lieuLivraison: ville.trim(),
      prix: bd.prix,
      source: "sauve_animaux_modal",
    });

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl md:rounded-[2rem]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-100 bg-white px-5 py-4">
          <div>
            <div className="text-sm font-extrabold text-emerald-900">Commander sur WhatsApp</div>
            <div className="text-sm text-gray-600">Quelques informations pour preparer votre demande</div>
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
            Renseignez ces informations, puis poursuivez simplement la commande sur WhatsApp.
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Prenom <span className="text-red-500">*</span>
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
            {touched.prenom && !prenomValide && <p className="mt-1 text-sm text-red-600">Veuillez entrer au moins 2 caracteres.</p>}
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
            {touched.sexe && !sexeValide && <p className="mt-1 text-sm text-red-600">Veuillez choisir une option.</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Ville de livraison / expedition <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ville}
              onChange={(event) => setVille(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, ville: true }))}
              placeholder="Ex : Douala"
              className={`w-full rounded-2xl border px-4 py-3 text-base text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-emerald-500 ${
                touched.ville && !villeValide ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              }`}
            />
            {touched.ville && !villeValide && <p className="mt-1 text-sm text-red-600">Veuillez entrer une ville.</p>}
          </div>

          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-white shadow-lg transition-colors hover:bg-[#1ebe5d]"
          >
            Commander sur WhatsApp <span aria-hidden="true">-&gt;</span>
          </button>
          <p className="text-center text-xs leading-5 text-gray-500">
            WhatsApp va s&apos;ouvrir avec votre demande deja prete.
          </p>
        </div>
      </div>
    </div>
  );
}
