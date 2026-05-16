"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BD, CommandeData } from "@/lib/catalogue";
import type { PaymentProvider, PaymentSettings } from "@/lib/payment-settings";
import ChariowWidgetEmbed from "@/components/ChariowWidgetEmbed";
import { fbqTrack, fbqTrackCustom } from "@/components/FacebookPixel";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

interface Props {
  bd: BD;
  paymentSettings: PaymentSettings;
  onClose: () => void;
}

type Step = "details" | "payment";

const INITIAL_DATA: CommandeData = {
  prenom: "",
  sexe: null,
  email: "",
  telephone: "",
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
      redirect_mode?: "hosted" | "widget";
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
  const [step, setStep] = useState<Step>("details");
  const [data, setData] = useState<CommandeData>(INITIAL_DATA);
  const [prenomTouched, setPrenomTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [telephoneTouched, setTelephoneTouched] = useState(false);
  const [quartierTouched, setQuartierTouched] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutStartResponse | null>(null);

  useEffect(() => {
    fbqTrack("InitiateCheckout", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
  }, [bd.id, bd.prix, bd.serie]);

  const activeProvider: PaymentProvider =
    paymentSettings.defaultProvider === "monetbil" && paymentSettings.monetbilEnabled ? "monetbil" : "chariow";

  const prenomValide = data.prenom.trim().length >= 2;
  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  const telephoneDigits = data.telephone.replace(/\D+/g, "");
  const telephoneValide = telephoneDigits.length === 9;
  const lieuLivraisonValide = data.quartier.trim().length >= 2;
  const detailsValides =
    prenomValide &&
    lieuLivraisonValide &&
    (activeProvider !== "chariow" || (emailValide && telephoneValide));
  const adresseComplete = useMemo(() => {
    return data.rue.trim().length > 0 ? `${data.quartier}, ${data.rue}` : data.quartier;
  }, [data.quartier, data.rue]);

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

  const startCheckout = async () => {
    setPrenomTouched(true);
    setEmailTouched(true);
    setTelephoneTouched(true);
    setQuartierTouched(true);

    if (!detailsValides || isSubmitting) return;

    setErrorMessage(null);
    setCheckoutInfo(null);
    setIsSubmitting(true);
    setStep("payment");

    fbqTrackCustom("MobileMoneyPaymentClick", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      provider: activeProvider,
      value: bd.prix,
      currency: "XAF",
      has_promo_code: Boolean(promoCode.trim()),
    });
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
        provider: activeProvider,
        seriesId: bd.id,
        seriesSlug: bd.slug || bd.id,
        seriesTitle: bd.serie,
      },
    });

    try {
      const response = await fetch("/api/payments/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bdSlug: bd.slug || bd.id,
          prenom: data.prenom.trim(),
          email: data.email.trim(),
          telephone: data.telephone.trim(),
          quartier: data.quartier.trim(),
          rue: data.rue.trim(),
          promoCode: promoCode.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as CheckoutStartResponse | null;
      if (!response.ok || !payload || !payload.ok) {
        throw new Error(payload && "message" in payload ? payload.message : "Impossible de préparer le paiement.");
      }

      setCheckoutInfo(payload);

      if (payload.provider === "monetbil") {
        window.location.assign(payload.payment_url);
      } else if (payload.redirect_mode === "hosted") {
        window.location.assign(payload.checkout_url);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Paiement indisponible.");
      setIsSubmitting(false);
      setStep("details");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      onClick={(event) => event.target === event.currentTarget && closeCheckout()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCheckout} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            {step === "payment" && !isSubmitting ? (
              <button
                onClick={() => setStep("details")}
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
                {step === "details" ? "Votre commande" : "Paiement par Mobile Money"}
              </div>
              <div className="text-sm text-gray-600">
                {step === "details" ? "Prénom et lieu de livraison" : "Paiement sécurisé"}
              </div>
            </div>
          </div>
          <button
            onClick={closeCheckout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg leading-none text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-6 pt-4">
          {step === "details" && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Prénom de l’enfant <span className="text-red-500">*</span>
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
                <p className="mt-1 text-sm font-medium text-green-700">Le prénom sera intégré dans la bande dessinée.</p>
              </div>

              {activeProvider === "chariow" ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(event) => setData({ ...data, email: event.target.value })}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="Ex : parent@email.com"
                      autoCapitalize="off"
                      className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        emailTouched && !emailValide ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                      }`}
                    />
                    {emailTouched && !emailValide && (
                      <p className="mt-1 text-sm text-red-600">Veuillez entrer un email valide.</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Numéro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={data.telephone}
                      onChange={(event) => {
                        const telephone = event.target.value.replace(/\D+/g, "");
                        setData({ ...data, telephone });
                        if (!telephoneTouched && telephone.length > 0) {
                          setTelephoneTouched(true);
                        }
                      }}
                      onBlur={() => setTelephoneTouched(true)}
                      placeholder="Ex : 6 99 00 11 22"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9}
                      autoComplete="tel"
                      autoCapitalize="off"
                      className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        telephoneTouched && !telephoneValide ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                      }`}
                    />
                    {telephoneTouched && !telephoneValide && (
                      <p className="mt-1 text-sm text-red-600">Veuillez entrer un numero de 9 chiffres.</p>
                    )}
                  </div>
                </>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Quartier / lieu de livraison <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.quartier}
                  onChange={(event) => setData({ ...data, quartier: event.target.value })}
                  onBlur={() => setQuartierTouched(true)}
                  placeholder="Ex : Bastos, Omnisport, Akwa..."
                  className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    quartierTouched && !lieuLivraisonValide ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                />
                {quartierTouched && !lieuLivraisonValide && (
                  <p className="mt-1 text-sm text-red-600">Veuillez entrer le lieu de livraison.</p>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
              )}

              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setPromoOpen((value) => !value)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold text-gray-800">Code promo</span>
                  <span className="text-sm font-semibold text-green-700">{promoOpen ? "Masquer" : "Ajouter"}</span>
                </button>
                {promoOpen && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value)}
                      placeholder="Entrez votre code promo"
                      autoCapitalize="characters"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={startCheckout}
                disabled={!detailsValides || isSubmitting}
                className={`w-full rounded-2xl py-4 text-base font-bold transition-colors ${
                  detailsValides && !isSubmitting
                    ? "bg-green-600 text-white shadow-lg hover:bg-green-500"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                {isSubmitting ? "Préparation du paiement..." : "Payer par Mobile Money"}
              </button>
              <p className="text-center text-xs leading-5 text-gray-500">
                Vous allez utiliser votre numéro Mobile Money dans la suite.
              </p>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-2xl">💳</div>
                <h2 className="text-lg font-extrabold text-gray-900">Paiement par Mobile Money</h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Après le paiement, notre équipe prépare votre BD personnalisée et confirme la livraison sur WhatsApp.
                </p>
              </div>

              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 text-lg">📚</span>
                  <div>
                    <div className="text-sm font-medium uppercase tracking-wide text-gray-700">Série</div>
                    <div className="text-sm font-semibold text-gray-900">{bd.serie}</div>
                    <div className="text-sm text-gray-700">{bd.nombrePages} pages illustrées · Personnalisée</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-0.5 text-lg">👶</span>
                  <div>
                    <div className="text-sm font-medium uppercase tracking-wide text-gray-700">Enfant</div>
                    <div className="text-sm font-semibold text-gray-900">{data.prenom}</div>
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
                    <div className="text-sm font-semibold text-green-800">Paiement par Mobile Money</div>
                    <div className="text-lg font-extrabold text-green-800">{bd.prix.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
              )}

              {activeProvider === "chariow" ? (
                <div className="space-y-4">
                  <ChariowWidgetEmbed
                    html={
                      checkoutInfo && checkoutInfo.ok && checkoutInfo.provider === "chariow"
                        ? checkoutInfo.snap_snippet
                        : paymentSettings.chariowSnapSnippet
                    }
                    productUrl={paymentSettings.chariowProductUrl}
                    productCode={paymentSettings.chariowProductCode}
                    childName={data.prenom.trim()}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (checkoutInfo && checkoutInfo.ok && checkoutInfo.provider === "monetbil") {
                      window.location.assign(checkoutInfo.payment_url);
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-green-500 active:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                >
                  {isSubmitting ? "Préparation du paiement..." : "Payer par Mobile Money"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
