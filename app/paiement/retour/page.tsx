import SiteChrome from "@/components/SiteChrome";
import { WHATSAPP_NUMBER } from "@/lib/catalogue";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import PurchasePixelTracker from "@/components/PurchasePixelTracker";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
};

type PaymentReturnPageProps = PageProps<"/paiement/retour">;

function formatStatus(status: string | null) {
  switch (status) {
    case "paid":
      return "Paiement confirmé";
    case "failed":
      return "Paiement échoué";
    case "expired":
      return "Paiement expiré";
    case "pending":
      return "Paiement en attente";
    default:
      return "Commande reçue";
  }
}

function formatMessage(order: PaymentOrder, bdSlug: string) {
  const address = order.delivery_rue ? `${order.delivery_quartier}, ${order.delivery_rue}` : order.delivery_quartier;
  const amount = typeof order.amount === "number" ? `${order.amount.toLocaleString("fr-FR")} FCFA` : "—";
  const lines = [
    "Bonjour, voici le récapitulatif de la commande :",
    "",
    `Série : ${order.series_title || "—"}`,
    `Référence : ${order.payment_ref}`,
    `Prénom de l'enfant : ${order.child_name || "—"}`,
    `Lieu de livraison : ${address || "—"}`,
    `Statut : ${formatStatus(order.status)}`,
    `Montant : ${amount}`,
    bdSlug ? `Lien BD : /bd/${bdSlug}` : null,
    "",
    "Merci de confirmer la prise en charge de la personnalisation.",
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
        .select("payment_ref, status, series_title, series_slug, child_name, delivery_quartier, delivery_rue, amount, currency")
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
    amount: order?.amount || null,
    currency: order?.currency || "XAF",
  };

  const isPaid = displayOrder.status === "paid";
  const headline = isPaid ? "Merci pour votre commande" : "Commande enregistrée";
  const message = isPaid
    ? "Votre paiement a bien été reçu. Notre équipe prépare la personnalisation et vous contacte sur WhatsApp pour la suite."
    : "Votre commande est enregistrée. Dès confirmation du paiement, nous lançons la personnalisation et vous contactons sur WhatsApp.";

  const address = displayOrder.delivery_rue
    ? `${displayOrder.delivery_quartier}, ${displayOrder.delivery_rue}`
    : displayOrder.delivery_quartier || "—";
  const amountLabel = displayOrder.amount ? `${displayOrder.amount.toLocaleString("fr-FR")} FCFA` : "—";
  const whatsappMessage = formatMessage(displayOrder, bdSlug);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <SiteChrome showFooter={false}>
      <PurchasePixelTracker
        paymentRef={displayOrder.payment_ref}
        status={displayOrder.status}
        value={displayOrder.amount}
        currency={displayOrder.currency}
        seriesTitle={displayOrder.series_title}
      />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16">
        <section className="w-full rounded-3xl border border-green-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 h-1 w-16 bg-green-700" />
          <h1 className="text-3xl font-extrabold text-gray-950 md:text-4xl">{headline}</h1>
          <p className="mt-4 text-base leading-7 text-gray-700">{message}</p>

          <div className="mt-6 grid gap-4 rounded-2xl bg-green-50 p-4 text-sm text-gray-700 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Référence</div>
              <div className="mt-1 font-bold text-gray-950">{displayOrder.payment_ref}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Série</div>
              <div className="mt-1 font-bold text-gray-950">{displayOrder.series_title}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prénom</div>
              <div className="mt-1 font-bold text-gray-950">{displayOrder.child_name || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Lieu de livraison</div>
              <div className="mt-1 font-bold text-gray-950">{address}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Statut</div>
              <div className="mt-1 font-bold text-gray-950">{formatStatus(displayOrder.status)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Montant</div>
              <div className="mt-1 font-bold text-gray-950">{amountLabel}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition-colors hover:bg-green-500"
            >
              Contacter sur WhatsApp
            </a>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
