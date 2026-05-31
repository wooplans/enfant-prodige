"use client";

import { useCallback, useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { buildWhatsAppMessage } from "@/lib/catalogue";
import { fbqTrack } from "@/components/FacebookPixel";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

interface Props {
  bd: BD;
  onClose: () => void;
}

export default function CheckoutModal({ bd, onClose }: Props) {
  const [prenom, setPrenom] = useState("");
  const [sexe, setSexe] = useState<"Garçon" | "Fille" | null>(null);
  const [prenomTouched, setPrenomTouched] = useState(false);

  const prenomValide = prenom.trim().length >= 2;
  const formValide = prenomValide && sexe !== null;

  useEffect(() => {
    fbqTrack("InitiateCheckout", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
  }, [bd.id, bd.prix, bd.serie]);

  const closeCheckout = useCallback(() => {
    trackAnalyticsEvent({
      eventType: "checkout_close",
      metadata: {
        source: "checkout_modal",
        seriesId: bd.id,
        seriesSlug: bd.slug || bd.id,
        seriesTitle: bd.serie,
      },
    });
    onClose();
  }, [bd.id, bd.serie, bd.slug, onClose]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCheckout();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [closeCheckout]);

  const handleSubmit = () => {
    setPrenomTouched(true);
    if (!formValide) return;

    fbqTrack("Lead", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
    trackAnalyticsEvent({
      eventType: "checkout_details_submit",
      metadata: {
        source: "checkout_modal",
        seriesId: bd.id,
        seriesSlug: bd.slug || bd.id,
        seriesTitle: bd.serie,
      },
    });

    const url = buildWhatsAppMessage(bd, { prenom: prenom.trim(), sexe });
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      onClick={(event) => event.target === event.currentTarget && closeCheckout()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCheckout} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <div className="text-sm font-bold text-gray-900">Personnaliser cette BD</div>
            <div className="text-sm text-gray-500">Indiquez le prénom de votre enfant</div>
          </div>
          <button
            onClick={closeCheckout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg leading-none text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-6 pt-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Prénom de l&apos;enfant <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              onBlur={() => setPrenomTouched(true)}
              placeholder="Ex : Kylian, Léa, Kofi..."
              maxLength={30}
              autoCapitalize="words"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                prenomTouched && !prenomValide ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
              }`}
            />
            {prenomTouched && !prenomValide && (
              <p className="mt-1 text-sm text-red-600">Veuillez entrer au moins 2 caractères.</p>
            )}
            <p className="mt-1.5 text-xs font-medium text-green-700">
              ✓ Son prénom apparaîtra sur la couverture et dans les dialogues.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Votre enfant est… <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(["Garçon", "Fille"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSexe(option)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-colors ${
                    sexe === option
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {option === "Garçon" ? "👦 Garçon" : "👧 Fille"}
                </button>
              ))}
            </div>
          </div>

          {prenom.trim().length >= 2 && sexe && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-800 font-medium">
                ✨ La BD sera personnalisée pour <strong>{prenom.trim()}</strong>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formValide}
            className={`w-full rounded-2xl py-4 text-base font-bold flex items-center justify-center gap-2 transition-colors ${
              formValide
                ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white shadow-lg"
                : "cursor-not-allowed bg-gray-200 text-gray-400"
            }`}
          >
            <WhatsAppIcon />
            Commander sur WhatsApp
          </button>
          <p className="text-center text-xs leading-5 text-gray-500">
            Vous serez redirigé vers WhatsApp pour finaliser votre commande.
          </p>
        </div>
      </div>
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
