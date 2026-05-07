"use client";

import { useState, useEffect } from "react";
import { BD, CommandeData, buildWhatsAppMessage } from "@/lib/catalogue";

interface Props {
  bd: BD;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const INITIAL_DATA: CommandeData = {
  prenom: "",
  sexe: null,
  quartier: "",
  rue: "",
};

export default function CheckoutModal({ bd, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<CommandeData>(INITIAL_DATA);
  const [prenomTouche, setPrenomTouche] = useState(false);
  const [quartierTouche, setQuartierTouche] = useState(false);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const prenomValide = data.prenom.trim().length >= 2;
  const sexeValide = data.sexe !== null;
  const etape1Valide = prenomValide && sexeValide;
  const etape2Valide = data.quartier.trim().length >= 2;

  const whatsappUrl = buildWhatsAppMessage(bd, data);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                ←
              </button>
            )}
            <div>
              <div className="font-bold text-gray-900 text-sm">
                {step === 1 && "L'enfant"}
                {step === 2 && "Adresse de livraison"}
                {step === 3 && "Récapitulatif"}
              </div>
              <div className="text-xs text-gray-400">Étape {step} sur 3</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Barre de progression */}
        <div className="flex gap-1 px-5 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="px-5 pb-6 pt-4">
          {/* ── ÉTAPE 1 : L'enfant ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="text-2xl mb-1">👶</div>
                <h2 className="text-lg font-extrabold text-gray-900">Parlez-nous de l'enfant</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Son prénom apparaîtra sur la couverture et dans les dialogues.
                </p>
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Prénom de l'enfant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.prenom}
                  onChange={(e) => setData({ ...data, prenom: e.target.value })}
                  onBlur={() => setPrenomTouche(true)}
                  placeholder="Ex : Kylian, Léa, Kofi…"
                  maxLength={30}
                  autoCapitalize="words"
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-base ${
                    prenomTouche && !prenomValide
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {prenomTouche && !prenomValide && (
                  <p className="text-xs text-red-500 mt-1">Veuillez entrer au moins 2 caractères</p>
                )}
                <p className="text-xs text-green-700 mt-1 font-medium">
                  ✨ Le prénom sera intégré dans la BD personnalisée
                </p>
              </div>

              {/* Sexe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sexe <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {(["Garçon", "Fille"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setData({ ...data, sexe: s })}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        data.sexe === s
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {s === "Garçon" ? "👦 Garçon" : "👧 Fille"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setPrenomTouche(true);
                  if (etape1Valide) setStep(2);
                }}
                disabled={!etape1Valide}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-colors ${
                  etape1Valide
                    ? "bg-green-600 hover:bg-green-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continuer →
              </button>
            </div>
          )}

          {/* ── ÉTAPE 2 : Livraison ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="text-2xl mb-1">📍</div>
                <h2 className="text-lg font-extrabold text-gray-900">Adresse de livraison</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Nous livrons à Yaoundé et Douala sous 24h après paiement.
                </p>
              </div>

              {/* Quartier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quartier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.quartier}
                  onChange={(e) => setData({ ...data, quartier: e.target.value })}
                  onBlur={() => setQuartierTouche(true)}
                  placeholder="Ex : Bastos, Omnisport, Akwa…"
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-base ${
                    quartierTouche && !etape2Valide
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {quartierTouche && !etape2Valide && (
                  <p className="text-xs text-red-500 mt-1">Veuillez entrer votre quartier</p>
                )}
              </div>

              {/* Rue */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Rue / Précision{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={data.rue}
                  onChange={(e) => setData({ ...data, rue: e.target.value })}
                  placeholder="Ex : Rue des Manguiers, près de la pharmacie…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-base bg-white"
                />
              </div>

              <button
                onClick={() => {
                  setQuartierTouche(true);
                  if (etape2Valide) setStep(3);
                }}
                disabled={!etape2Valide}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-colors ${
                  etape2Valide
                    ? "bg-green-600 hover:bg-green-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Voir le récapitulatif →
              </button>
            </div>
          )}

          {/* ── ÉTAPE 3 : Récapitulatif ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="text-2xl mb-1">✅</div>
                <h2 className="text-lg font-extrabold text-gray-900">Votre commande</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Vérifiez les informations puis envoyez votre commande sur WhatsApp.
                </p>
              </div>

              {/* Récap */}
              <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 border border-gray-100">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="text-lg mt-0.5">📚</span>
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Série</div>
                    <div className="font-semibold text-gray-900 text-sm">{bd.serie}</div>
                    <div className="text-xs text-gray-500">{bd.nombrePages} pages illustrées · Personnalisée</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="text-lg mt-0.5">👶</span>
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Enfant</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {data.prenom} <span className="text-gray-500 font-normal">( {data.sexe} )</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="text-lg mt-0.5">📍</span>
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Livraison</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {data.quartier}
                      {data.rue && <span className="text-gray-500 font-normal">, {data.rue}</span>}
                    </div>
                    <div className="text-xs text-gray-500">Sous 24h après paiement</div>
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>💰</span> BD personnalisée
                    </div>
                    <div className="font-bold text-gray-900">{bd.prix.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📦</span> Frais de livraison
                    </div>
                    <div className="text-gray-500 text-sm">+ {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA <span className="text-xs">(à la réception)</span></div>
                  </div>
                </div>
                <div className="px-4 py-3.5 bg-green-50 rounded-b-2xl">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-semibold text-green-800">💳 À payer par Mobile Money</div>
                    <div className="font-extrabold text-green-800 text-lg">{bd.prix.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
              </div>

              {/* CTA WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                <WhatsAppIcon />
                Envoyer ma commande sur WhatsApp
              </a>
              <p className="text-xs text-gray-400 text-center">
                Votre message est déjà rédigé — envoyez-le et attendez notre confirmation sous quelques minutes.
              </p>
            </div>
          )}
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
