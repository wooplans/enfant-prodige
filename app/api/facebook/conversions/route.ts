import { NextResponse } from "next/server";
import { z } from "zod";
import { hasFacebookConversionsToken, sendFacebookPurchaseEvent } from "@/lib/facebook-conversions";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  eventId: z.string().min(1),
  paymentRef: z.string().min(1),
  eventSourceUrl: z.string().url(),
  status: z.string().min(1),
  value: z.number().nullable().optional(),
  currency: z.string().optional(),
  seriesTitle: z.string().nullable().optional(),
  promoCode: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  testEventCode: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  if (!hasFacebookConversionsToken()) {
    return NextResponse.json({ ok: false, message: "Facebook CAPI non configuré." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Corps JSON invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Données d'événement invalides." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: order, error: orderError } = await supabase
      .from("payment_orders")
      .select("payment_ref, status")
      .eq("payment_ref", parsed.data.paymentRef)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ ok: false, message: orderError.message }, { status: 500 });
    }

    if (!order || order.status !== "paid" || parsed.data.status !== "paid") {
      return NextResponse.json(
        { ok: false, message: "Achat non confirme." },
        { status: 409 }
      );
    }

    const forwardedFor = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const result = await sendFacebookPurchaseEvent({
      ...parsed.data,
      value: parsed.data.value ?? null,
      clientIpAddress: forwardedFor,
      clientUserAgent: userAgent,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Impossible d'envoyer l'événement Meta.",
      },
      { status: 502 }
    );
  }
}
