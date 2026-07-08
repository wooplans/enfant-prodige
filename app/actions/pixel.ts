"use server";

import { FB_PIXEL_ID } from "@/components/FacebookPixel";
import { headers } from "next/headers";
import crypto from "node:crypto";

interface OrderTrackingData {
  prenom: string;
  sexe: string | null;
  trancheAge: string;
  langue: string;
  lieuLivraison: string;
  quartier: string;
  rue?: string;
  prix: number;
  serie: string;
  id: string;
}

export async function trackWhatsAppOrderServer(data: OrderTrackingData) {
  console.log(`[SERVER-EVENT] CommandeWhatsApp triggered for BD: ${data.serie}, Child: ${data.prenom}`);

  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("FACEBOOK_ACCESS_TOKEN is not set in environment variables. Server-side tracking skipped.");
    return { success: false, reason: "missing_token" };
  }

  // Helper to hash user data (SHA-256) for privacy and matching as required by FB Conversions API
  const hash = (val: string) => {
    if (!val) return "";
    return crypto
      .createHash("sha256")
      .update(val.trim().toLowerCase())
      .digest("hex");
  };

  try {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || "";

    const userData = {
      fn: hash(data.prenom), // First Name hashed
      client_user_agent: userAgent,
      client_ip_address: ipAddress,
    };

    const eventData = {
      event_name: "CommandeWhatsApp",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: `https://bd.wooplans.com/bd/${data.id}`,
      action_source: "website",
      user_data: userData,
      custom_data: {
        content_name: data.serie,
        content_ids: [data.id],
        content_type: "product",
        value: data.prix,
        currency: "XAF",
        langue: data.langue,
        trancheAge: data.trancheAge,
        lieuLivraison: data.lieuLivraison,
        quartier: data.quartier,
      },
    };

    const response = await fetch(`https://graph.facebook.com/v17.0/${FB_PIXEL_ID}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [eventData],
        access_token: accessToken,
      }),
    });

    const resJson = await response.json();
    if (!response.ok) {
      console.error("[CAPI Error]", resJson);
      return { success: false, error: resJson };
    }

    console.log("[SERVER-EVENT] Facebook CAPI tracked successfully:", resJson);
    return { success: true, result: resJson };
  } catch (err) {
    console.error("[SERVER-EVENT] CAPI Exception:", err);
    return { success: false, error: String(err) };
  }
}
