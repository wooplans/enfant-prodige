"use client";

import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";
import { fbqTrack, fbqTrackCustom } from "@/components/FacebookPixel";
import { WHATSAPP_ORDER_EVENT_NAME } from "@/lib/facebook";

type TrackWhatsAppOrderOptions = {
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  prenom: string;
  lieuLivraison: string;
  prix: number;
  source: string;
  eventSourceUrl?: string;
};

export async function trackWhatsAppOrder(options: TrackWhatsAppOrderOptions) {
  const payload = {
    content_name: options.seriesTitle,
    content_ids: [options.seriesId],
    content_type: "product",
    value: options.prix,
    currency: "XAF",
    prenom: options.prenom.trim(),
    lieu_livraison: options.lieuLivraison.trim(),
    source: options.source,
  };

  fbqTrackCustom(WHATSAPP_ORDER_EVENT_NAME, payload);
  fbqTrack("Lead", payload);
  trackAnalyticsEvent({
    eventType: "whatsapp_click",
    metadata: {
      source: options.source,
      seriesId: options.seriesId,
      seriesSlug: options.seriesSlug,
      seriesTitle: options.seriesTitle,
    },
  });

  try {
    await fetch("/api/whatsapp/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventSourceUrl: options.eventSourceUrl ?? window.location.href,
        serie: options.seriesTitle,
        prenom: options.prenom.trim(),
        lieuLivraison: options.lieuLivraison.trim(),
        prix: options.prix,
      }),
      keepalive: true,
    });
  } catch {
    // Browser pixel remains the primary path if the server-side copy fails.
  }
}
