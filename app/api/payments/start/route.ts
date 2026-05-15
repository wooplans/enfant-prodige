import { NextResponse } from "next/server";
import { z } from "zod";
import { createChariowCheckout, hasChariowApiKey } from "@/lib/chariow";
import { getPublicSeriesBySlug } from "@/lib/series";
import { createMonetbilPaymentLink, buildMonetbilPaymentRef } from "@/lib/monetbil";
import { getPaymentSettings, resolveActivePaymentProvider } from "@/lib/payment-settings";
import { isMissingTableError } from "@/lib/supabase-errors";
import { hasSupabaseAdminConfig, getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const startCheckoutSchema = z.object({
  bdSlug: z.string().min(1),
  prenom: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")).default(""),
  telephone: z.string().optional().default(""),
  quartier: z.string().min(2),
  rue: z.string().optional().default(""),
  promoCode: z.string().optional().default(""),
});

export async function POST(request: Request) {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = startCheckoutSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Les informations de commande sont incomplètes." }, { status: 400 });
  }

  const series = await getPublicSeriesBySlug(parsed.data.bdSlug);
  if (!series) {
    return NextResponse.json({ ok: false, message: "Cette série n'est plus disponible." }, { status: 404 });
  }

  const settings = await getPaymentSettings();
  const provider = resolveActivePaymentProvider(settings);
  if (provider === "chariow") {
    const email = parsed.data.email.trim();
    const phoneDigits = parsed.data.telephone.replace(/\D+/g, "");

    if (!email || phoneDigits.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Email et numero Mobile Money requis pour le paiement Chariow." },
        { status: 400 }
      );
    }
  }

  const paymentRef = buildMonetbilPaymentRef(series.slug);
  const requestUrl = request.url;
  const canPersist = hasSupabaseAdminConfig();
  const supabase = canPersist ? getSupabaseAdmin() : null;
  const now = new Date().toISOString();

  if (provider === "monetbil") {
    const monetbil = await createMonetbilPaymentLink({
      requestUrl,
      paymentRef,
      amount: series.prix,
      slug: series.slug,
      prenom: parsed.data.prenom,
      sexe: null,
      quartier: parsed.data.quartier,
      rue: parsed.data.rue,
    });

    if (supabase) {
      const { error } = await supabase.from("payment_orders").insert({
        payment_ref: paymentRef,
        provider: "monetbil",
        series_id: series.id,
        series_slug: series.slug,
        series_title: series.serie,
        child_name: parsed.data.prenom,
        child_gender: null,
        delivery_quartier: parsed.data.quartier,
        delivery_rue: parsed.data.rue || null,
        amount: series.prix,
        currency: "XAF",
        country: "CM",
        operator_code: process.env.MONETBIL_DEFAULT_OPERATOR?.trim() || null,
        status: "pending",
        payment_url: monetbil.payment_url,
        checkout_url: monetbil.payment_url,
        return_url: monetbil.returnUrl,
        notify_url: monetbil.notifyUrl,
        provider_payload: monetbil.requestPayload,
        monetbil_request: monetbil.requestPayload,
        monetbil_response: monetbil,
        metadata: {
          provider: "monetbil",
          source: "checkout-start",
          promoCode: parsed.data.promoCode.trim() || null,
        },
        created_at: now,
        updated_at: now,
      });

      if (error) {
        if (isMissingTableError(error, "payment_orders")) {
          console.warn("payment_orders table missing during checkout start", error.message);
        } else {
          return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      provider: "monetbil",
      payment_ref: paymentRef,
      payment_url: monetbil.payment_url,
      return_url: monetbil.returnUrl,
      notify_url: monetbil.notifyUrl,
      amount: series.prix,
      currency: "XAF",
      product_code: settings.chariowProductCode,
    });
  }

  if (supabase) {
    const returnUrl = hasChariowApiKey()
      ? `${new URL(requestUrl).origin.replace(/\/$/, "")}/paiement/retour?bd=${encodeURIComponent(series.slug)}&payment_ref=${encodeURIComponent(paymentRef)}`
      : null;
    const { error } = await supabase.from("payment_orders").insert({
      payment_ref: paymentRef,
      provider: "chariow",
      series_id: series.id,
      series_slug: series.slug,
      series_title: series.serie,
      child_name: parsed.data.prenom,
      child_gender: null,
      delivery_quartier: parsed.data.quartier,
      delivery_rue: parsed.data.rue || null,
      amount: series.prix,
      currency: "XAF",
      country: "CM",
      provider_order_ref: settings.chariowProductCode,
      provider_product_code: settings.chariowProductCode,
      status: "pending",
      checkout_url: settings.chariowProductUrl,
      return_url: returnUrl,
      provider_payload: {
        snapSnippet: Boolean(settings.chariowSnapSnippet),
        productCode: settings.chariowProductCode,
        productUrl: settings.chariowProductUrl,
        email: parsed.data.email.trim().toLowerCase(),
        telephone: parsed.data.telephone.trim(),
        promoCode: parsed.data.promoCode.trim(),
      },
      metadata: {
        provider: "chariow",
        source: "checkout-start",
        promoCode: parsed.data.promoCode.trim() || null,
      },
      created_at: now,
      updated_at: now,
    });

    if (error) {
      if (isMissingTableError(error, "payment_orders")) {
        console.warn("payment_orders table missing during checkout start", error.message);
      } else {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }
    }
  }

  if (hasChariowApiKey()) {
    try {
      const checkout = await createChariowCheckout({
        requestUrl,
        productId: settings.chariowProductCode,
        paymentRef,
        slug: series.slug,
        prenom: parsed.data.prenom,
        email: parsed.data.email,
        telephone: parsed.data.telephone,
        quartier: parsed.data.quartier,
        rue: parsed.data.rue,
        discountCode: parsed.data.promoCode.trim(),
      });

      if (supabase) {
        const { error } = await supabase
          .from("payment_orders")
          .update({
            provider_order_ref: checkout.saleId,
            checkout_url: checkout.checkoutUrl,
            return_url: checkout.redirectUrl,
            provider_payload: checkout.requestPayload,
            notification_payload: checkout.raw,
            updated_at: now,
          })
          .eq("payment_ref", paymentRef);

        if (error && !isMissingTableError(error, "payment_orders")) {
          return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
        }
      }

      return NextResponse.json({
        ok: true,
        provider: "chariow",
        payment_ref: paymentRef,
        checkout_url: checkout.checkoutUrl,
        product_code: settings.chariowProductCode,
        snap_snippet: "",
        redirect_mode: "hosted",
      });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error instanceof Error ? error.message : "Impossible de préparer le paiement Chariow.",
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    provider: "chariow",
    payment_ref: paymentRef,
    checkout_url: settings.chariowProductUrl,
    product_code: settings.chariowProductCode,
    snap_snippet: settings.chariowSnapSnippet,
    redirect_mode: "widget",
    amount: series.prix,
    currency: "XAF",
  });
}
