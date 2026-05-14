import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicSeriesBySlug } from "@/lib/series";
import { createMonetbilPaymentLink, buildMonetbilPaymentRef } from "@/lib/monetbil";
import { getPaymentSettings, resolveActivePaymentProvider } from "@/lib/payment-settings";
import { hasSupabaseAdminConfig, getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const startCheckoutSchema = z.object({
  bdSlug: z.string().min(1),
  prenom: z.string().min(2),
  sexe: z.enum(["Garçon", "Fille"]),
  quartier: z.string().min(2),
  rue: z.string().optional().default(""),
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
      sexe: parsed.data.sexe,
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
        child_gender: parsed.data.sexe,
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
        },
        created_at: now,
        updated_at: now,
      });

      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
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
    const { error } = await supabase.from("payment_orders").insert({
      payment_ref: paymentRef,
      provider: "chariow",
      series_id: series.id,
      series_slug: series.slug,
      series_title: series.serie,
      child_name: parsed.data.prenom,
      child_gender: parsed.data.sexe,
      delivery_quartier: parsed.data.quartier,
      delivery_rue: parsed.data.rue || null,
      amount: series.prix,
      currency: "XAF",
      country: "CM",
      provider_order_ref: settings.chariowProductCode,
      provider_product_code: settings.chariowProductCode,
      status: "pending",
      checkout_url: settings.chariowProductUrl,
      provider_payload: {
        snapSnippet: Boolean(settings.chariowSnapSnippet),
        productCode: settings.chariowProductCode,
        productUrl: settings.chariowProductUrl,
      },
      metadata: {
        provider: "chariow",
        source: "checkout-start",
      },
      created_at: now,
      updated_at: now,
    });

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    provider: "chariow",
    payment_ref: paymentRef,
    checkout_url: settings.chariowProductUrl,
    product_code: settings.chariowProductCode,
    snap_snippet: settings.chariowSnapSnippet,
    amount: series.prix,
    currency: "XAF",
  });
}
