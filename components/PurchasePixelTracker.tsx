"use client";

import { useEffect } from "react";
import { fbqTrack } from "@/components/FacebookPixel";

type Props = {
  paymentRef: string;
  status: string;
  value: number | null;
  currency?: string | null;
  seriesTitle?: string | null;
  shouldTrackPurchase?: boolean;
  customerEmail?: string | null;
  customerPhone?: string | null;
  promoCode?: string | null;
};

export default function PurchasePixelTracker({
  paymentRef,
  status,
  value,
  currency = "XAF",
  seriesTitle,
  shouldTrackPurchase = false,
  customerEmail = null,
  customerPhone = null,
  promoCode = null,
}: Props) {
  useEffect(() => {
    if (!paymentRef || !shouldTrackPurchase) return;

    const storageKey = `fb_purchase_tracked:${paymentRef}`;
    if (window.sessionStorage.getItem(storageKey) === "1") return;
    const eventId = `purchase:${paymentRef}`;

    fbqTrack("Purchase", {
      content_name: seriesTitle || paymentRef,
      content_type: "product",
      currency: currency || "XAF",
      value: typeof value === "number" ? value : undefined,
      order_id: paymentRef,
      content_ids: seriesTitle ? [seriesTitle] : undefined,
    }, { eventID: eventId });

    window.sessionStorage.setItem(storageKey, "1");
  }, [currency, customerEmail, customerPhone, paymentRef, promoCode, seriesTitle, shouldTrackPurchase, status, value]);

  return null;
}
