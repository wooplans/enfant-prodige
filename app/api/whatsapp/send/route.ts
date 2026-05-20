import { NextResponse } from "next/server";

const GREEN_API_URL = "https://7107.api.greenapi.com";
const GREEN_API_INSTANCE = "7107359294";
const GREEN_API_TOKEN = "54867fab05a0492a983efbb44011ace74f3f5e1d18d64cebaf";
const SELLER_CHAT_ID = "237694327885@c.us";

export async function POST(request: Request) {
  let body: {
    serie: string;
    prenom: string;
    lieuLivraison: string;
    prix: number;
    fraisLivraison: number;
    whatsappClient: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const { serie, prenom, lieuLivraison, prix, fraisLivraison, whatsappClient } = body;

  if (!serie || !prenom || !lieuLivraison || !whatsappClient) {
    return NextResponse.json({ ok: false, message: "Champs manquants." }, { status: 400 });
  }

  const clientNum = whatsappClient.replace(/\D/g, "");
  const formattedClient = clientNum.startsWith("237") ? `+${clientNum}` : `+237${clientNum}`;

  const message = [
    "🛒 *Nouvelle commande — Enfant Prodige*",
    "",
    `📚 Série : ${serie}`,
    `👶 Prénom : ${prenom}`,
    `📍 Livraison : ${lieuLivraison}`,
    `💰 Prix : ${prix.toLocaleString("fr-FR")} FCFA + ${fraisLivraison.toLocaleString("fr-FR")} FCFA livraison (à la réception)`,
    "",
    `📱 WhatsApp client : ${formattedClient}`,
  ].join("\n");

  try {
    const response = await fetch(
      `${GREEN_API_URL}/waInstance${GREEN_API_INSTANCE}/sendMessage/${GREEN_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: SELLER_CHAT_ID, message }),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Green API error:", response.status, text);
      return NextResponse.json(
        { ok: false, message: "Impossible d'envoyer la commande. Réessayez." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Green API fetch error:", error);
    return NextResponse.json(
      { ok: false, message: "Erreur réseau. Réessayez." },
      { status: 502 }
    );
  }
}
