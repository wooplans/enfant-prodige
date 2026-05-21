import { NextResponse } from "next/server";
import { hasFacebookConversionsToken, sendFacebookWhatsAppOrderEvent } from "@/lib/facebook-conversions";

export async function POST(request: Request) {
  if (!hasFacebookConversionsToken()) {
    return NextResponse.json({ ok: true });
  }

  let body: {
    serie: string;
    prenom: string;
    lieuLivraison: string;
    prix: number;
    eventSourceUrl?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { serie, prenom, lieuLivraison, prix, eventSourceUrl } = body;
  if (!serie || !prenom || !lieuLivraison) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? null;
  const ua = request.headers.get("user-agent") ?? null;

  try {
    await sendFacebookWhatsAppOrderEvent({
      eventSourceUrl: eventSourceUrl ?? new URL(request.url).origin,
      serie,
      prenom,
      lieuLivraison,
      prix,
      clientIpAddress: ip,
      clientUserAgent: ua,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Facebook Conversions API (track) error:", err);
    return NextResponse.json({ ok: true });
  }
}
