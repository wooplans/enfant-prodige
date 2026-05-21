import "server-only";

import crypto from "node:crypto";
import { FACEBOOK_PIXEL_ID } from "@/lib/facebook";

export type FacebookPurchaseEventInput = {
  eventId: string;
  eventSourceUrl: string;
  paymentRef: string;
  status: string;
  value: number | null;
  currency?: string | null;
  seriesTitle?: string | null;
  promoCode?: string | null;
  email?: string | null;
  phone?: string | null;
  testEventCode?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
};

export type FacebookWhatsAppOrderInput = {
  eventSourceUrl: string;
  serie: string;
  prenom: string;
  lieuLivraison: string;
  prix: number;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
};

export function hasFacebookConversionsToken() {
  return Boolean(process.env.FACEBOOK_CONVERSION_API_TOKEN?.trim());
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D+/g, "");
}

function buildUserData(input: FacebookPurchaseEventInput) {
  const userData: Record<string, string> = {};

  const email = input.email?.trim();
  if (email) {
    userData.em = sha256(normalizeEmail(email));
  }

  const phone = input.phone?.trim();
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      userData.ph = sha256(normalizedPhone);
    }
  }

  if (input.clientIpAddress) {
    userData.client_ip_address = input.clientIpAddress;
  }

  if (input.clientUserAgent) {
    userData.client_user_agent = input.clientUserAgent;
  }

  return userData;
}

export async function sendFacebookPurchaseEvent(input: FacebookPurchaseEventInput) {
  const token = process.env.FACEBOOK_CONVERSION_API_TOKEN?.trim();
  if (!token) {
    throw new Error("FACEBOOK_CONVERSION_API_TOKEN manquant.");
  }

  const version = process.env.FACEBOOK_GRAPH_API_VERSION?.trim() || "v20.0";
  const eventTime = Math.floor(Date.now() / 1000);
  const response = await fetch(`https://graph.facebook.com/${version}/${FACEBOOK_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          event_id: input.eventId,
          action_source: "website",
          event_source_url: input.eventSourceUrl,
          user_data: buildUserData(input),
          custom_data: {
            currency: input.currency || "XAF",
            value: typeof input.value === "number" ? input.value : undefined,
            content_name: input.seriesTitle || input.paymentRef,
            content_type: "product",
            content_ids: input.seriesTitle ? [input.seriesTitle] : undefined,
            order_id: input.paymentRef,
            promo_code: input.promoCode || undefined,
          },
        },
      ],
      ...(input.testEventCode?.trim() ? { test_event_code: input.testEventCode.trim() } : {}),
    }),
    cache: "no-store",
  });

  const responseText = await response.text();
  let parsed: { events_received?: number; messages?: unknown[]; error?: { message?: string } };

  try {
    parsed = JSON.parse(responseText) as typeof parsed;
  } catch {
    throw new Error(`Réponse Meta invalide: ${responseText.slice(0, 180)}`);
  }

  if (!response.ok) {
    throw new Error(parsed?.error?.message || `Meta a refusé la demande (${response.status}).`);
  }

  return parsed;
}

export async function sendFacebookWhatsAppOrderEvent(input: FacebookWhatsAppOrderInput) {
  const token = process.env.FACEBOOK_CONVERSION_API_TOKEN?.trim();
  if (!token) {
    throw new Error("FACEBOOK_CONVERSION_API_TOKEN manquant.");
  }

  const version = process.env.FACEBOOK_GRAPH_API_VERSION?.trim() || "v20.0";
  const eventTime = Math.floor(Date.now() / 1000);

  const userData: Record<string, string> = {};
  if (input.clientIpAddress) userData.client_ip_address = input.clientIpAddress;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;

  const response = await fetch(
    `https://graph.facebook.com/${version}/${FACEBOOK_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "CommandeWhatsApp",
            event_time: eventTime,
            event_id: `whatsapp:${input.serie}:${input.prenom}:${eventTime}`,
            action_source: "website",
            event_source_url: input.eventSourceUrl,
            user_data: userData,
            custom_data: {
              currency: "XAF",
              value: input.prix,
              content_name: input.serie,
              content_type: "product",
              content_ids: [input.serie],
              prenom: input.prenom,
              lieu_livraison: input.lieuLivraison,
            },
          },
        ],
      }),
      cache: "no-store",
    }
  );

  const responseText = await response.text();
  let parsed: { events_received?: number; error?: { message?: string } };
  try {
    parsed = JSON.parse(responseText) as typeof parsed;
  } catch {
    throw new Error(`Réponse Meta invalide: ${responseText.slice(0, 180)}`);
  }

  if (!response.ok) {
    throw new Error(parsed?.error?.message || `Meta a refusé la demande (${response.status}).`);
  }

  return parsed;
}

