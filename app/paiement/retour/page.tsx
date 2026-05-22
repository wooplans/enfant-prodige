import SiteChrome from "@/components/SiteChrome";
import { WHATSAPP_NUMBER } from "@/lib/catalogue";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import PurchasePixelTracker from "@/components/PurchasePixelTracker";
import Link from "next/link";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

type PaymentOrder = {
  payment_ref: string;
  status: string;
  series_title: string | null;
  series_slug: string | null;
  child_name: string | null;
  delivery_quartier: string | null;
  delivery_rue: string | null;
  amount: number | null;
  currency: string | null;
  provider_payload: Record<string, unknown> | null;
  metadata: {
    promoCode?: string | null;
  } | null;
};

type PaymentReturnPageProps = PageProps<"/paiement/retour">;

type StatusConfig = {
  icon: string;
  label: string;
  badgeClass: string;
  headlineClass: string;
  cardClass: string;
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "paid":
      return {
        icon: "✅",
        label: "Paiement confirmé",
        badgeClass: "bg-green-100 text-green-800 border border-green-200",
        headlineClass: "text-green-900",
        cardClass: "border-green-200 bg-green-50",
      };
    case "failed":
      return {
        icon: "❌",
        label: "Paiement échoué",
        badgeClass: "bg-red-100 text-red-800 border border-red-200",
        headlineClass: "text-red-900",
        cardClass: "border-red-200 bg-red-50",
      };
    case "expired":
      return {
        icon: "⏰",
        label: "Paiement expiré",
        badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
        headlineClass: "text-gray-900",
        cardClass: "border-gray-200 bg-gray-50",
      };
    default:
      return {
        icon: "⏳",
        label: "En attente de confirmation",
        badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
        headlineClass: "text-gray-900",
        cardClass: "border-amber-200 bg-amber-50",
      };
  }
}

function formatWhatsAppMessage(order: PaymentOrder, bdSlug: string) {
  const address = order.delivery_rue
    ? `${order.delivery_quartier}, ${order.delivery_rue}`
    : order.delivery_quartier;
  const amount = typeof order.amount === "number" ? `${order.amount.toLocaleString("fr-FR")} FCFA` : "—";

  const lines = [
    "Bonjour, voici le récapitulatif de ma commande :",
    "",
    `Série : ${order.series_title || "—"}`,
    `Référence : ${order.payment_ref}`,
    `Prénom de l'enfant : ${order.child_name || "—"}`,
    `Lieu de livraison : ${address || "—"}`,
    `Montant payé : ${amount}`,
    bdSlug ? `Lien BD : /bd/${bdSlug}` : null,
    "",
    "Merci de confirmer la prise en charge.",
  ].filter(Boolean);

  return lines.join("\n");
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  const params = (await searchParams) ?? {};
  const paymentRef = firstValue(params.payment_ref) || "";
  const bdSlug = firstValue(params.bd) || "";
  let order: PaymentOrder | null = null;

  if (paymentRef) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("payment_orders")
        .select(
          "payment_ref, status, series_title, series_slug, child_name, delivery_quartier, delivery_rue, amount, currency, provider_payload, metadata"
        )
        .eq("payment_ref", paymentRef)
        .maybeSingle();

      order = (data as PaymentOrder | null) ?? null;
    } catch {
      order = null;
    }
  }

  const displayOrder: PaymentOrder = {
    payment_ref: paymentRef || "—",
    status: order?.status || "pending",
    series_title: order?.series_title || "votre BD",
    series_slug: order?.series_slug || bdSlug || null,
    child_name: order?.child_name || null,
    delivery_quartier: order?.delivery_quartier || null,
    delivery_rue: order?.delivery_rue || null,
    amount: order?.amount ?? null,
    currency: order?.currency || "XAF",
    provider_payload: (order?.provider_payload as Record<string, unknown> | null) || null,
    metadata: (order?.metadata as PaymentOrder["metadata"]) || null,
  };

  const isPaid = displayOrder.status === "paid";
  const isPending = displayOrder.status === "pending";
  const isFailed = displayOrder.status === "failed";

  const statusConfig = getStatusConfig(displayOrder.status);
  const customerEmail = readString(displayOrder.provider_payload?.email);
  const customerPhone =
    readString(displayOrder.provider_payload?.telephone) ||
    (displayOrder.provider_payload?.phone &&
    typeof displayOrder.provider_payload.phone === "object" &&
    "number" in displayOrder.provider_payload.phone
      ? readString((displayOrder.provider_payload.phone as Record<string, unknown>).number)
      : null);

  const address = displayOrder.delivery_rue
    ? `${displayOrder.delivery_quartier}, ${displayOrder.delivery_rue}`
    : displayOrder.delivery_quartier || "—";

  const amountLabel = displayOrder.amount
    ? `${displayOrder.amount.toLocaleString("fr-FR")} FCFA`
    : "—";

  const seriesSlug = displayOrder.series_slug || bdSlug;

  const whatsappMessage = formatWhatsAppMessage(displayOrder, bdSlug);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const headline = isPaid
    ? "Merci pour votre commande !"
    : isFailed
      ? "Paiement non abouti"
      : "Commande enregistrée";

  const message = isPaid
    ? "Votre paiement a bien été reçu. Notre équipe prépare la personnalisation et vous contacte sur WhatsApp sous 30 min."
    : isFailed
      ? "Le paiement n'a pas pu être traité. Contactez-nous sur WhatsApp si vous avez déjà été débité."
      : "Votre commande est enregistrée. Dès confirmation du paiement, nous lançons la personnalisation et vous contactons sur WhatsApp sous 30 min.";

  return (
    <SiteChrome showFooter={false}>
      <PurchasePixelTracker
        paymentRef={displayOrder.payment_ref}
        status={displayOrder.status}
        value={displayOrder.amount}
        currency={displayOrder.currency}
        seriesTitle={displayOrder.series_title}
        shouldTrackPurchase={isPaid}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        promoCode={displayOrder.metadata?.promoCode || null}
      />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">

        {/* Status + headline */}
        <div className="mb-6 text-center">
          <div className="text-5xl mb-4">{statusConfig.icon}</div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusConfig.badgeClass}`}>
            {statusConfig.label}
          </span>
          <h1 className={`mt-3 text-2xl font-extrabold md:text-3xl ${statusConfig.headlineClass}`}>{headline}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600 max-w-md mx-auto">{message}</p>
        </div>

        {/* Order recap card */}
        <div className={`rounded-2xl border p-5 mb-5 ${statusConfig.cardClass}`}>
          <div className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-500">Récapitulatif de la commande</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Référence</div>
              <div className="mt-0.5 font-mono text-xs font-bold text-gray-800 break-all">{displayOrder.payment_ref}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Série</div>
              <div className="mt-0.5 font-bold text-gray-900">{displayOrder.series_title}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Prénom de l'enfant</div>
              <div className="mt-0.5 font-bold text-gray-900">{displayOrder.child_name || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Lieu de livraison</div>
              <div className="mt-0.5 font-bold text-gray-900">{address}</div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="mt-4 border-t border-black/10 pt-4 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">BD personnalisée</span>
              <span className="font-bold text-gray-900">{amountLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Frais d'expédition</span>
              <span className="text-gray-500">1 000 FCFA <span className="text-xs">(payés à la réception du colis)</span></span>
            </div>
          </div>
        </div>

        {/* Next steps — only for paid / pending */}
        {(isPaid || isPending) && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Prochaines étapes</div>
            <ol className="space-y-3">
              {[
                {
                  num: "1",
                  title: "Personnalisation",
                  desc: isPaid ? "Notre équipe intègre le prénom de votre enfant dans la BD." : "Dès confirmation du paiement, nous lançons la personnalisation.",
                },
                {
                  num: "2",
                  title: "Contact WhatsApp sous 30 min",
                  desc: "Vous recevez un message de confirmation avec les détails de livraison.",
                },
                {
                  num: "3",
                  title: "Expédition en 48h",
                  desc: "Votre colis est expédié à votre adresse partout au Cameroun.",
                },
              ].map(({ num, title, desc }) => (
                <li key={num} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-extrabold text-white">
                    {num}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{title}</div>
                    <div className="text-xs leading-5 text-gray-500">{desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="flex flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 text-base font-bold text-white shadow-md transition-colors hover:bg-green-500 active:bg-green-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {isPaid ? "Confirmer sur WhatsApp" : "Contacter notre équipe sur WhatsApp"}
          </a>

          {seriesSlug && (
            <Link
              href={`/bd/${seriesSlug}`}
              className="text-center text-sm font-medium text-gray-500 underline-offset-2 hover:underline"
            >
              Retour à la page du produit
            </Link>
          )}
        </div>
      </main>
    </SiteChrome>
  );
}
