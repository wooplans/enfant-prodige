import { NextResponse } from "next/server";
import { z } from "zod";
import { hasFacebookConversionsToken, sendFacebookWhatsAppOrderEvent } from "@/lib/facebook-conversions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  eventSourceUrl: z.string().url(),
  serie: z.string().trim().min(1).max(120),
  prenom: z.string().trim().min(2).max(60),
  lieuLivraison: z.string().trim().min(2).max(160),
  prix: z.number().int().positive(),
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
    const forwardedFor = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const result = await sendFacebookWhatsAppOrderEvent({
      ...parsed.data,
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
