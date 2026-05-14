import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const paymentRef = firstValue(searchParams?.payment_ref) || "";
  const bdSlug = firstValue(searchParams?.bd) || "";
  let paymentStatus: string | null = null;
  let seriesTitle = "votre BD";

  if (paymentRef) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("payment_orders")
        .select("status, series_title")
        .eq("payment_ref", paymentRef)
        .maybeSingle();

      paymentStatus = data?.status ?? null;
      seriesTitle = data?.series_title ?? seriesTitle;
    } catch {
      paymentStatus = null;
    }
  }

  const isPaid = paymentStatus === "paid";
  const headline = isPaid ? "Paiement confirmé" : "Paiement reçu";
  const message = isPaid
    ? "Votre paiement Monetbil a bien été confirmé. Nous lançons la personnalisation maintenant."
    : "Votre paiement Monetbil est en cours de confirmation. Nous vous tenons au courant dès validation.";

  return (
    <SiteChrome showFooter={false}>
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16">
        <section className="w-full rounded-3xl border border-green-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 h-1 w-16 bg-green-700" />
          <h1 className="text-3xl font-extrabold text-gray-950 md:text-4xl">{headline}</h1>
          <p className="mt-4 text-base leading-7 text-gray-700">{message}</p>

          <div className="mt-6 grid gap-4 rounded-2xl bg-green-50 p-4 text-sm text-gray-700 md:grid-cols-2">
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs">Référence</div>
              <div className="mt-1 font-bold text-gray-950">{paymentRef || "—"}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs">Série</div>
              <div className="mt-1 font-bold text-gray-950">{seriesTitle}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs">Statut</div>
              <div className="mt-1 font-bold text-gray-950">{paymentStatus || "en attente"}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs">Suivi</div>
              <div className="mt-1 font-bold text-gray-950">
                {bdSlug ? `BD / ${bdSlug}` : "Commande enregistrée"}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {bdSlug ? (
              <Link
                href={`/bd/${bdSlug}`}
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition-colors hover:bg-green-600"
              >
                Revenir à la BD
              </Link>
            ) : null}
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Voir le catalogue
            </Link>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
