"use client";

import { useEffect, useMemo, useState } from "react";
import type { BD, CommandeData } from "@/lib/catalogue";
import type { PaymentProvider, PaymentSettings } from "@/lib/payment-settings";
import ChariowWidgetEmbed from "@/components/ChariowWidgetEmbed";
import { fbqTrack } from "@/components/FacebookPixel";

interface Props {
  bd: BD;
  paymentSettings: PaymentSettings;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const INITIAL_DATA: CommandeData = {
  prenom: "",
  sexe: null,
  quartier: "",
  rue: "",
};

type CheckoutStartResponse =
  | {
      ok: true;
      provider: "chariow";
      payment_ref: string;
      checkout_url: string;
      product_code: string;
      snap_snippet: string;
    }
  | {
      ok: true;
      provider: "monetbil";
      payment_ref: string;
      payment_url: string;
      return_url: string;
      notify_url: string;
    }
  | {
      ok: false;
      message: string;
    };

export default function CheckoutModal({ bd, paymentSettings, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<CommandeData>(INITIAL_DATA);
  const [prenomTouched, setPrenomTouched] = useState(false);
  const [quartierTouched, setQuartierTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutStartResponse | null>(null);

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
    fbqTrack("InitiateCheckout", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
  }, [bd.id, bd.prix, bd.serie]);

  const prenomValide = data.prenom.trim().length >= 2;
  const sexeValide = data.sexe !== null;
  const etape1Valide = prenomValide && sexeValide;
  const etape2Valide = data.quartier.trim().length >= 2;
  const adresseComplete = useMemo(() => {
    return data.rue.trim().length > 0 ? `${data.quartier}, ${data.rue}` : data.quartier;
  }, [data.quartier, data.rue]);

  const activeProvider: PaymentProvider =
    paymentSettings.defaultProvider === "monetbil" && paymentSettings.monetbilEnabled
      ? "monetbil"
      : "chariow";

  useEffect(() => {
    if (step !== 3 || checkoutInfo || isSubmitting) return;

    let cancelled = false;

    const startCheckout = async () => {
      setErrorMessage(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/payments/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bdSlug: bd.slug || bd.id,
            prenom: data.prenom.trim(),
            sexe: data.sexe,
            quartier: data.quartier.trim(),
            rue: data.rue.trim(),
          }),
        });

        const payload = (await response.json().catch(() => null)) as CheckoutStartResponse | null;
        if (!response.ok || !payload || !payload.ok) {
          throw new Error(payload && "message" in payload ? payload.message : "Impossible de préparer le paiement.");
        }

        if (cancelled) return;

        setCheckoutInfo(payload);

        if (payload.provider === "monetbil") {
          window.location.assign(payload.payment_url);
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Paiement indisponible.");
          setIsSubmitting(false);
        }
      }
    };

    void startCheckout();

    return () => {
      cancelled = true;
    };
  }, [step, checkoutInfo, isSubmitting, bd.id, bd.prix, bd.serie, bd.slug, data.prenom, data.quartier, data.rue, data.sexe]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep((current) => (current - 1) as Step)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                aria-label="Retour"
              >
                ←
              </button>
            ) : (
              <div className="h-8 w-8" />
            )}
            <div>
              <div className="text-sm font-bold text-gray-900">
                {step === 1 && "L&apos;enfant"}
                {step === 2 && "Adresse de livraison"}
                {step === 3 && activeProvider === "chariow" && "Paiement Chariow"}
                {step === 3 && activeProvider === "monetbil" && "Paiement Monetbil"}
              </div>
              <div className="text-sm text-gray-600">Étape {step} sur 3</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg leading-none text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          {[1, 2, 3].map((currentStep) => (
            <div
              key={currentStep}
              className={`h-1 flex-1 rounded-full transition-colors ${
                currentStep <= step ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="px-5 pb-6 pt-4">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-2xl">👶</div>
                <h2 className="text-lg font-extrabold text-gray-900">Parlez-nous de l&apos;enfant</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Son prénom apparaîtra sur la couverture et dans les dialogues.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Prénom de l&apos;enfant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.prenom}
                  onChange={(event) => setData({ ...data, prenom: event.target.value })}
                  onBlur={() => setPrenomTouched(true)}
                  placeholder="Ex : Kylian, Léa, Kofi..."
                  maxLength={30}
                  autoCapitalize="words"
                  className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    prenomTouched && !prenomValide ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                />
                {prenomTouched && !prenomValide && (
                  <p className="mt-1 text-sm text-red-600">Veuillez entrer au moins 2 caractères.</p>
                )}
                <p className="mt-1 text-sm font-medium text-green-700">
                  ✨ Le prénom sera intégré dans la BD personnalisée
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Sexe <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {(["Garçon", "Fille"] as const).map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setData({ ...data, sexe: sex })}
                      className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                        data.sexe === sex
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {sex === "Garçon" ? "👦 Garçon" : "👧 Fille"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setPrenomTouched(true);
                  if (etape1Valide) {
                    fbqTrack("Lead", {
                      content_name: bd.serie,
                      content_ids: [bd.id],
                      content_type: "product",
                      value: bd.prix,
                      currency: "XAF",
                    });
                    setStep(2);
                  }
                }}
                disabled={!etape1Valide}
                className={`w-full rounded-2xl py-4 text-base font-bold transition-colors ${
                  etape1Valide
                    ? "bg-green-600 text-white shadow-lg hover:bg-green-500"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-2xl">📍</div>
                <h2 className="text-lg font-extrabold text-gray-900">Adresse de livraison</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Nous livrons à Yaoundé et Douala sous 24h après paiement.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Quartier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.quartier}
                  onChange={(event) => setData({ ...data, quartier: event.target.value })}
                  onBlur={() => setQuartierTouched(true)}
                  placeholder="Ex : Bastos, Omnisport, Akwa..."
                  className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    quartierTouched && !etape2Valide ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                />
                {quartierTouched && !etape2Valide && (
                  <p className="mt-1 text-sm text-red-600">Veuillez entrer votre quartier.</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Rue / Précision <span className="font-normal text-gray-600">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={data.rue}
                  onChange={(event) => setData({ ...data, rue: event.target.value })}
                  placeholder="Ex : Rue des Manguiers, près de la pharmacie..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={() => {
                  setQuartierTouched(true);
                  if (etape2Valide) setStep(3);
                }}
                disabled={!etape2Valide}
                className={`w-full rounded-2xl py-4 text-base font-bold transition-colors ${
                  etape2Valide
                    ? "bg-green-600 text-white shadow-lg hover:bg-green-500"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                Voir le paiement →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-2xl">💳</div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {activeProvider === "chariow" ? "Paiement Chariow" : "Paiement Monetbil"}
                </h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Vérifiez les informations puis poursuivez vers le paiement sécurisé.
                </p>
              </div>

              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 text-lg">📚</span>
                  <div>
                    <div className="text-sm font-medium uppercase tracking-wide text-gray-700">Série</div>
                    <div className="text-sm font-semibold text-gray-900">{bd.serie}</div>
                    <div className="text-sm text-gray-700">
                      {bd.nombrePages} pages illustrées · Personnalisée
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 text-lg">👶</span>
                  <div>
                    <div className="text-sm font-medium uppercase tracking-wide text-gray-700">Enfant</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {data.prenom} <span className="font-normal text-gray-700">({data.sexe})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 text-lg">📍</span>
                  <div>
                    <div className="text-sm font-medium uppercase tracking-wide text-gray-700">Livraison</div>
                    <div className="text-sm font-semibold text-gray-900">{adresseComplete}</div>
                    <div className="text-sm text-gray-700">Sous 24h après paiement</div>
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <div className="mb-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>💰</span> BD personnalisée
                    </div>
                    <div className="font-bold text-gray-900">{bd.prix.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📦</span> Frais de livraison
                    </div>
                    <div className="text-sm text-gray-700">
                      + {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA <span>(à la réception)</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-b-2xl bg-green-50 px-4 py-3.5">
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold text-green-800">
                      {activeProvider === "chariow" ? "🛍️ Paiement via Chariow" : "💳 À payer via Monetbil"}
                    </div>
                    <div className="text-lg font-extrabold text-green-800">
                      {bd.prix.toLocaleString("fr-FR")} FCFA
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {activeProvider === "chariow" ? (
                <div className="space-y-4">
                  <ChariowWidgetEmbed
                    html={checkoutInfo && checkoutInfo.ok && checkoutInfo.provider === "chariow" ? checkoutInfo.snap_snippet : paymentSettings.chariowSnapSnippet}
                    productUrl={paymentSettings.chariowProductUrl}
                    productCode={paymentSettings.chariowProductCode}
                  />
                  <p className="text-center text-sm text-gray-600">
                    Paiement Chariow activé par défaut pour cette boutique.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (checkoutInfo && checkoutInfo.ok && checkoutInfo.provider === "monetbil") {
                      window.location.assign(checkoutInfo.payment_url);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-green-500 active:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                >
                  {isSubmitting ? "Préparation du paiement..." : "Payer avec Monetbil"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
