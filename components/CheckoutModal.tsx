"use client";

import { useCallback, useEffect, useState } from "react";
import type { BD } from "@/lib/catalogue";
import { fbqTrack, fbqTrackCustom } from "@/components/FacebookPixel";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";

interface Props {
  bd: BD;
  onClose: () => void;
  deliveryDateLabel?: string;
}

type Step = "details" | "summary";

const MOBILE_WHATSAPP = "237691001580";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return true;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function buildWhatsAppUrl(
  serie: string,
  prenom: string,
  lieuLivraison: string,
  prix: number,
  fraisLivraison: number,
  whatsappClient?: string,
): string {
  const lines = [
    "Bonjour ! Je souhaite commander :",
    "",
    `📚 Série : ${serie}`,
    `👶 Prénom de l'enfant : ${prenom}`,
    `📍 Lieu de livraison : ${lieuLivraison}`,
    `💰 Total : ${(prix + fraisLivraison).toLocaleString("fr-FR")} FCFA par Mobile Money`,
    `   (BD ${prix.toLocaleString("fr-FR")} + expédition ${fraisLivraison.toLocaleString("fr-FR")})`,
  ];
  if (whatsappClient) {
    lines.push("", `📱 Mon WhatsApp : ${whatsappClient}`);
  }
  lines.push("", "Merci !");
  return `https://wa.me/${MOBILE_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export default function CheckoutModal({ bd, onClose, deliveryDateLabel }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [prenom, setPrenom] = useState("");
  const [lieuLivraison, setLieuLivraison] = useState("");
  const [whatsappClient, setWhatsappClient] = useState("");
  const [prenomTouched, setPrenomTouched] = useState(false);
  const [lieuTouched, setLieuTouched] = useState(false);
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    fbqTrack("InitiateCheckout", {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
    });
  }, [bd.id, bd.prix, bd.serie]);

  const prenomValide = prenom.trim().length >= 2;
  const lieuValide = lieuLivraison.trim().length >= 2;
  const whatsappDigits = whatsappClient.replace(/\D/g, "");
  const whatsappValide = whatsappDigits.length >= 9;
  const detailsValides = prenomValide && lieuValide && (isMobile || whatsappValide);

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
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCheckout();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [closeCheckout]);

  const goToSummary = () => {
    setPrenomTouched(true);
    setLieuTouched(true);
    if (!isMobile) setWhatsappTouched(true);
    if (!detailsValides) return;

    trackAnalyticsEvent({
      eventType: "checkout_details_submit",
      metadata: {
        source: "checkout_modal",
        provider: "whatsapp",
        seriesId: bd.id,
        seriesSlug: bd.slug || bd.id,
        seriesTitle: bd.serie,
      },
    });
    setStep("summary");
  };

  const sendOrder = async () => {
    const pixelPayload = {
      content_name: bd.serie,
      content_ids: [bd.id],
      content_type: "product",
      value: bd.prix,
      currency: "XAF",
      canal: isMobile ? "whatsapp_mobile" : "whatsapp_desktop",
      prenom: prenom.trim(),
      lieu_livraison: lieuLivraison.trim(),
    };

    const firePixel = (canal: string) => {
      fbqTrackCustom("CommandeWhatsApp", { ...pixelPayload, canal });
      fbqTrack("Lead", { ...pixelPayload, canal });
      fetch("/api/whatsapp/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie: bd.serie,
          prenom: prenom.trim(),
          lieuLivraison: lieuLivraison.trim(),
          prix: bd.prix,
          eventSourceUrl: window.location.href,
        }),
        keepalive: true,
      }).catch(() => undefined);
    };

    if (isMobile) {
      firePixel("whatsapp_mobile");
      window.open(
        buildWhatsAppUrl(bd.serie, prenom.trim(), lieuLivraison.trim(), bd.prix, bd.fraisLivraison),
        "_blank",
      );
      return;
    }

    // Desktop: essaie Green API, fallback automatique vers WhatsApp Web
    setIsSending(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serie: bd.serie,
          prenom: prenom.trim(),
          lieuLivraison: lieuLivraison.trim(),
          prix: bd.prix,
          fraisLivraison: bd.fraisLivraison,
          whatsappClient: whatsappClient.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "api_error");
      }
      firePixel("whatsapp_desktop_api");
      setSentOk(true);
    } catch {
      // Fallback : ouvre WhatsApp Web avec numéro client inclus dans le message
      firePixel("whatsapp_desktop_fallback");
      window.open(
        buildWhatsAppUrl(
          bd.serie,
          prenom.trim(),
          lieuLivraison.trim(),
          bd.prix,
          bd.fraisLivraison,
          whatsappClient.trim(),
        ),
        "_blank",
      );
      setUsedFallback(true);
      setSentOk(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      onClick={(e) => e.target === e.currentTarget && closeCheckout()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCheckout} />

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 rounded-t-3xl border-b border-gray-100 bg-white px-5 pt-4 pb-0">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              {step === "summary" ? (
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
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-gray-900">
                    {step === "details" ? "Votre commande" : "Récapitulatif"}
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-400">
                    {step === "details" ? "1 / 2" : "2 / 2"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {step === "details"
                    ? isMobile
                      ? "Prénom et adresse d'expédition"
                      : "Prénom, expédition et contact"
                    : "Vérifiez avant d'envoyer"}
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
          <div className="flex gap-1.5 pb-3">
            <div className="h-1 flex-1 rounded-full bg-green-600" />
            <div
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                step === "summary" ? "bg-green-600" : "bg-gray-200"
              }`}
            />
          </div>
        </div>

        {/* Bandeau social proof */}
        {bd.nombreCommandesSemaine > 0 && (
          <div className="bg-green-50 border-b border-green-100 px-5 py-2 text-xs font-semibold text-green-800 flex items-center gap-2">
            🔥 {bd.nombreCommandesSemaine} familles ont commandé cette semaine · ⭐ {bd.note}/5
          </div>
        )}

        <div className="px-5 pb-6 pt-4">
          {/* ─── STEP 1: DETAILS ─── */}
          {step === "details" && (
            <div className="space-y-5">
              {/* Prénom */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Prénom de l&apos;enfant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  onBlur={() => setPrenomTouched(true)}
                  placeholder="Ex : Kylian, Léa, Kofi..."
                  maxLength={30}
                  autoCapitalize="words"
                  autoFocus
                  className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    prenomTouched && !prenomValide
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {prenomTouched && !prenomValide && (
                  <p className="mt-1 text-sm text-red-600">Veuillez entrer au moins 2 caractères.</p>
                )}
                <p className="mt-1 text-sm font-medium text-green-700">
                  Le prénom sera intégré dans la bande dessinée.
                </p>
              </div>

              {/* Lieu de livraison */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Ville / adresse d&apos;expédition <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lieuLivraison}
                  onChange={(e) => setLieuLivraison(e.target.value)}
                  onBlur={() => setLieuTouched(true)}
                  placeholder="Ex : Douala Akwa, Bafoussam, Kribi..."
                  className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    lieuTouched && !lieuValide
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {lieuTouched && !lieuValide && (
                  <p className="mt-1 text-sm text-red-600">Veuillez entrer l&apos;adresse d&apos;expédition.</p>
                )}
              </div>

              {/* WhatsApp client (desktop seulement) */}
              {!isMobile && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Votre numéro WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappClient}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d\s+]/g, "");
                      setWhatsappClient(v);
                      if (!whatsappTouched && v.length > 0) setWhatsappTouched(true);
                    }}
                    onBlur={() => setWhatsappTouched(true)}
                    placeholder="Ex : 6 99 00 11 22"
                    inputMode="tel"
                    autoComplete="tel"
                    className={`w-full rounded-xl border px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      whatsappTouched && !whatsappValide
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  />
                  {whatsappTouched && !whatsappValide && (
                    <p className="mt-1 text-sm text-red-600">Veuillez entrer un numéro valide.</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Nous vous contacterons sur ce numéro pour confirmer votre commande.
                  </p>
                </div>
              )}

              {/* Résumé prix */}
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between font-semibold text-gray-800">
                  <span>BD personnalisée</span>
                  <span>{bd.prix.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-gray-500">
                  <span>Expédition</span>
                  <span>+ {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              <button
                type="button"
                onClick={goToSummary}
                className="w-full rounded-2xl py-4 text-base font-bold transition-colors bg-green-600 text-white shadow-lg hover:bg-green-500"
              >
                Voir le récapitulatif →
              </button>
            </div>
          )}

          {/* ─── STEP 2: SUMMARY ─── */}
          {step === "summary" && (
            <div className="space-y-5">
              {sentOk ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl">
                    {usedFallback ? "📱" : "✅"}
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    {usedFallback ? "WhatsApp ouvert !" : "Commande envoyée !"}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {usedFallback ? (
                      <>
                        WhatsApp s&apos;est ouvert dans un nouvel onglet avec votre commande pré-remplie.{" "}
                        <span className="font-semibold text-green-700">Appuyez sur Envoyer</span> pour
                        confirmer votre commande.
                      </>
                    ) : (
                      <>
                        Votre commande a bien été reçue. Nous vous contacterons sur WhatsApp au{" "}
                        <span className="font-semibold text-green-700">{whatsappClient}</span> pour
                        confirmer l&apos;expédition et le paiement.
                      </>
                    )}
                  </p>
                  <button
                    onClick={closeCheckout}
                    className="mt-2 rounded-2xl bg-green-600 px-8 py-3 font-bold text-white hover:bg-green-500"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="mb-1 text-2xl">📱</div>
                    <h2 className="text-lg font-extrabold text-gray-900">Votre commande</h2>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {isMobile
                        ? "Vérifiez le récapitulatif puis envoyez directement sur WhatsApp."
                        : "Vérifiez le récapitulatif — nous vous contacterons par WhatsApp pour confirmer."}
                    </p>
                  </div>

                  {/* Récapitulatif */}
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50">
                    <div className="flex items-start gap-3 px-4 py-3.5">
                      <span className="mt-0.5 text-lg">📚</span>
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Série</div>
                        <div className="text-sm font-semibold text-gray-900">{bd.serie}</div>
                        <div className="text-sm text-gray-600">{bd.nombrePages} pages · BD personnalisée</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-3.5">
                      <span className="mt-0.5 text-lg">👶</span>
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Prénom de l&apos;enfant</div>
                        <div className="text-sm font-semibold text-gray-900">{prenom.trim()}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-3.5">
                      <span className="mt-0.5 text-lg">📍</span>
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Expédition</div>
                        <div className="text-sm font-semibold text-gray-900">{lieuLivraison.trim()}</div>
                        <div className="text-sm text-gray-600">
                          {deliveryDateLabel ? `Expédié le ${deliveryDateLabel}` : "Sous 48h après confirmation"}
                        </div>
                      </div>
                    </div>
                    {!isMobile && whatsappClient && (
                      <div className="flex items-start gap-3 px-4 py-3.5">
                        <span className="mt-0.5 text-lg">💬</span>
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">WhatsApp</div>
                          <div className="text-sm font-semibold text-gray-900">{whatsappClient}</div>
                        </div>
                      </div>
                    )}
                    <div className="px-4 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">BD personnalisée</div>
                          <div className="text-xs text-gray-500 mt-0.5">BD personnalisée avec le prénom</div>
                        </div>
                        <span className="font-extrabold text-gray-900 text-base shrink-0">{bd.prix.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm text-gray-700">Frais d&apos;expédition</div>
                          <div className="text-xs text-gray-500 mt-0.5">Payé par Mobile Money avant expédition</div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 shrink-0">+ {bd.fraisLivraison.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    </div>
                    <div className="rounded-b-2xl bg-green-50 px-4 py-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-green-900">Total par Mobile Money</div>
                        <div className="text-lg font-extrabold text-green-900">{(bd.prix + bd.fraisLivraison).toLocaleString("fr-FR")} FCFA</div>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={sendOrder}
                    disabled={isSending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#1ebe5d] active:bg-[#19a853] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSending ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.845L.057 23.885a.5.5 0 0 0 .609.63l6.208-1.624A11.95 11.95 0 0 0 12 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.001-1.368l-.356-.213-3.705.969.993-3.617-.235-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" />
                        </svg>
                        {isMobile ? "Envoyer ma commande sur WhatsApp" : "Envoyer ma commande"}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs leading-5 text-gray-500">
                    {isMobile
                      ? <span>WhatsApp va s&apos;ouvrir — <strong>appuyez sur Envoyer</strong> pour confirmer votre commande.</span>
                      : "Nous vous répondrons sous peu pour confirmer l'expédition."}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
