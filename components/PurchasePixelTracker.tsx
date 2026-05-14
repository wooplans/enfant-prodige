"use client";

import { useEffect } from "react";
import { fbqTrack } from "@/components/FacebookPixel";

type Props = {
  paymentRef: string;
  status: string;
  value: number | null;
  currency?: string | null;
  seriesTitle?: string | null;
};

export default function PurchasePixelTracker({ paymentRef, status, value, currency = "XAF", seriesTitle }: Props) {
  useEffect(() => {
    if (status !== "paid" || !paymentRef) return;

    const storageKey = `fb_purchase_tracked:${paymentRef}`;
    if (window.sessionStorage.getItem(storageKey) === "1") return;

    fbqTrack("Purchase", {
      content_name: seriesTitle || paymentRef,
      content_type: "product",
      currency: currency || "XAF",
      value: typeof value === "number" ? value : undefined,
      order_id: paymentRef,
      content_ids: seriesTitle ? [seriesTitle] : undefined,
    });

    window.sessionStorage.setItem(storageKey, "1");
  }, [currency, paymentRef, seriesTitle, status, value]);

  return null;
}
