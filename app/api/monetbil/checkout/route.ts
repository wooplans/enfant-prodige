import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  buildMonetbilPaymentRef,
  createMonetbilPaymentLink,
  monetbilCheckoutSchema,
} from "@/lib/monetbil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checkoutRequestSchema = monetbilCheckoutSchema;

export async function POST(request: Request) {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Les informations de commande sont incomplètes." },
      { status: 400 }
    );
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;

  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Configuration Supabase manquante.",
      },
      { status: 500 }
    );
  }

  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id, slug, serie, titre, prix, frais_livraison, published, disponible, archived_at")
    .eq("slug", parsed.data.bdSlug)
    .eq("published", true)
    .eq("disponible", true)
    .is("archived_at", null)
    .maybeSingle();

  if (seriesError) {
    return NextResponse.json(
      { ok: false, message: `Série introuvable: ${seriesError.message}` },
      { status: 500 }
    );
  }

  if (!series) {
    return NextResponse.json({ ok: false, message: "Cette série n'est plus disponible." }, { status: 404 });
  }

  const paymentRef = buildMonetbilPaymentRef(series.slug);
  const amount = Number(series.prix);
  const requestUrl = request.url;
  const metadata = {
    childGender: parsed.data.sexe,
    deliveryQuartier: parsed.data.quartier,
    deliveryRue: parsed.data.rue,
  };

  const checkoutRow = {
    payment_ref: paymentRef,
    series_id: series.id,
    series_slug: series.slug,
    series_title: series.serie || series.titre,
    child_name: parsed.data.prenom,
    child_gender: parsed.data.sexe,
    delivery_quartier: parsed.data.quartier,
    delivery_rue: parsed.data.rue || null,
    amount,
    currency: "XAF",
    country: "CM",
    operator_code: process.env.MONETBIL_DEFAULT_OPERATOR?.trim() || null,
    status: "pending",
    metadata,
    monetbil_request: {},
    monetbil_response: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("payment_orders").insert(checkoutRow);
  if (insertError) {
    return NextResponse.json(
      { ok: false, message: `Impossible d'enregistrer la commande: ${insertError.message}` },
      { status: 500 }
    );
  }

  try {
    const monetbil = await createMonetbilPaymentLink({
      requestUrl,
      paymentRef,
      amount,
      slug: series.slug,
      prenom: parsed.data.prenom,
      sexe: parsed.data.sexe,
      quartier: parsed.data.quartier,
      rue: parsed.data.rue,
    });

    const { error: updateError } = await supabase
      .from("payment_orders")
      .update({
        payment_url: monetbil.payment_url,
        return_url: monetbil.returnUrl,
        notify_url: monetbil.notifyUrl,
        monetbil_request: monetbil.requestPayload,
        monetbil_response: monetbil,
        operator_code: process.env.MONETBIL_DEFAULT_OPERATOR?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_ref", paymentRef);

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: `Commande créée mais non finalisée: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      payment_ref: paymentRef,
      payment_url: monetbil.payment_url,
      return_url: monetbil.returnUrl,
      notify_url: monetbil.notifyUrl,
      amount,
      currency: "XAF",
      country: "CM",
      operator: process.env.MONETBIL_DEFAULT_OPERATOR?.trim() || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Monetbil est indisponible.";

    await supabase
      .from("payment_orders")
      .update({
        status: "failed",
        monetbil_response: { error: message },
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("payment_ref", paymentRef);

    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
