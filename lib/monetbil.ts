import "server-only";

import crypto from "node:crypto";
import { z } from "zod";

export const monetbilCheckoutSchema = z.object({
  bdSlug: z.string().min(1),
  prenom: z.string().min(2),
  sexe: z.enum(["Garçon", "Fille"]),
  quartier: z.string().min(2),
  rue: z.string().optional().default(""),
});

export const monetbilNotificationSchema = z
  .object({
    payment_ref: z.string().optional(),
    paymentRef: z.string().optional(),
    reference: z.string().optional(),
    status: z.string().optional(),
    state: z.string().optional(),
    payment_status: z.string().optional(),
    transaction_ref: z.string().optional(),
    transactionRef: z.string().optional(),
    transaction_id: z.string().optional(),
    transactionId: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    currency: z.string().optional(),
    operator: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  })
  .passthrough();

export type MonetbilCheckoutInput = z.infer<typeof monetbilCheckoutSchema>;
export type MonetbilNotificationInput = z.infer<typeof monetbilNotificationSchema>;

export type MonetbilOrderStatus = "pending" | "paid" | "failed" | "expired";

export function getMonetbilConfig() {
  const serviceKey = process.env.MONETBIL_SERVICE_KEY?.trim();
  const serviceSecret = process.env.MONETBIL_SERVICE_SECRET?.trim();
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const defaultCountry = process.env.MONETBIL_DEFAULT_COUNTRY?.trim() || "CM";
  const defaultCurrency = process.env.MONETBIL_DEFAULT_CURRENCY?.trim() || "XAF";
  const defaultLocale = process.env.MONETBIL_DEFAULT_LOCALE?.trim() || "fr";
  const defaultOperator = process.env.MONETBIL_DEFAULT_OPERATOR?.trim() || "";

  if (!serviceKey) {
    throw new Error("MONETBIL_SERVICE_KEY manquant.");
  }

  if (!serviceSecret) {
    throw new Error("MONETBIL_SERVICE_SECRET manquant.");
  }

  return {
    serviceKey,
    serviceSecret,
    publicSiteUrl,
    defaultCountry,
    defaultCurrency,
    defaultLocale,
    defaultOperator,
  };
}

export function buildMonetbilPaymentRef(slug: string) {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "bd";

  return `EP-${safeSlug}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`.toUpperCase();
}

export function buildMonetbilToken(paymentRef: string, serviceSecret: string) {
  return crypto.createHmac("sha256", serviceSecret).update(paymentRef).digest("hex");
}

export function buildMonetbilCallbackUrls(requestUrl: string, paymentRef: string, slug: string) {
  const { serviceSecret } = getMonetbilConfig();
  const baseUrl = new URL(requestUrl).origin.replace(/\/$/, "");
  const token = buildMonetbilToken(paymentRef, serviceSecret);

  return {
    returnUrl: `${baseUrl}/paiement/retour?bd=${encodeURIComponent(slug)}&payment_ref=${encodeURIComponent(paymentRef)}`,
    notifyUrl: `${baseUrl}/api/monetbil/notify?payment_ref=${encodeURIComponent(paymentRef)}&token=${encodeURIComponent(token)}`,
  };
}

export function normalizeMonetbilStatus(value: string | undefined | null): MonetbilOrderStatus {
  const lower = (value || "").toLowerCase();

  if (["paid", "success", "succeeded", "confirmed", "complete", "completed", "done"].includes(lower)) {
    return "paid";
  }

  if (["expired", "timeout", "timed_out", "timedout"].includes(lower)) {
    return "expired";
  }

  if (["failed", "error", "cancelled", "canceled", "rejected", "declined", "aborted"].includes(lower)) {
    return "failed";
  }

  return "pending";
}

export function extractMonetbilPaymentRef(payload: Record<string, unknown>, fallback?: string | null) {
  const candidate =
    payload.payment_ref ??
    payload.paymentRef ??
    payload.reference ??
    fallback ??
    null;

  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

export function extractMonetbilTransactionRef(payload: Record<string, unknown>) {
  const candidate =
    payload.transaction_ref ??
    payload.transactionRef ??
    payload.transaction_id ??
    payload.transactionId ??
    null;

  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate.trim() : null;
}

export async function createMonetbilPaymentLink(options: {
  requestUrl: string;
  paymentRef: string;
  amount: number;
  slug: string;
  prenom: string;
  sexe: "Garçon" | "Fille";
  quartier: string;
  rue?: string;
}) {
  const config = getMonetbilConfig();
  const { returnUrl, notifyUrl } = buildMonetbilCallbackUrls(options.requestUrl, options.paymentRef, options.slug);
  const payload = new URLSearchParams({
    amount: String(options.amount),
    locale: config.defaultLocale,
    country: config.defaultCountry,
    currency: config.defaultCurrency,
    item_ref: options.slug,
    payment_ref: options.paymentRef,
    return_url: returnUrl,
    notify_url: notifyUrl,
    user: options.prenom,
    first_name: options.prenom,
  });

  if (config.defaultOperator) {
    payload.set("operator", config.defaultOperator);
  }

  const response = await fetch(`https://api.monetbil.com/widget/v2.1/${config.serviceKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
    },
    body: payload.toString(),
    cache: "no-store",
  });

  const responseText = await response.text();
  let parsed: { success?: boolean; payment_url?: string; message?: string; error?: string };

  try {
    parsed = JSON.parse(responseText) as typeof parsed;
  } catch {
    throw new Error(`Réponse Monetbil invalide: ${responseText.slice(0, 180)}`);
  }

  if (!response.ok || !parsed.success || !parsed.payment_url) {
    throw new Error(parsed.message || parsed.error || `Monetbil a refusé la demande (${response.status}).`);
  }

  return {
    ...parsed,
    returnUrl,
    notifyUrl,
    requestPayload: Object.fromEntries(payload.entries()),
  };
}
