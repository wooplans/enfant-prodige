import Link from "next/link";
import { archiveSeriesAction, logoutAction, restoreSeriesAction, togglePublishSeriesAction } from "@/app/admin/actions";
import AdminAnalyticsPanel from "@/components/AdminAnalyticsPanel";
import AdminPaymentSettingsForm from "@/components/AdminPaymentSettingsForm";
import SiteChrome from "@/components/SiteChrome";
import { requireAdminPage } from "@/lib/admin-auth";
import { getAnalyticsSummary, parseAnalyticsRange } from "@/lib/analytics";
import { getAdminSeries } from "@/lib/series";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { getPaymentSettings } from "@/lib/payment-settings";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{
    analyticsRange?: string | string[];
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdminPage();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const analyticsRange = parseAnalyticsRange(resolvedSearchParams.analyticsRange);
  const configured = hasSupabaseAdminConfig();
  const [series, paymentSettings, analyticsSummary] = await Promise.all([
    configured ? getAdminSeries() : Promise.resolve([]),
    getPaymentSettings(),
    getAnalyticsSummary(analyticsRange),
  ]);

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Administration</p>
            <h1 className="text-3xl font-extrabold text-gray-950">Séries BD</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/series/new" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-600">
              Ajouter une série
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-white">
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {!configured && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800">
            Configurez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY pour utiliser le panel admin.
          </div>
        )}

        <div className="mb-8">
          <AdminPaymentSettingsForm settings={paymentSettings} />
        </div>

        <AdminAnalyticsPanel summary={analyticsSummary} />

        <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {series.length === 0 && configured && (
              <div className="p-8 text-center text-gray-600">Aucune série enregistrée.</div>
            )}
            {series.map((item) => (
              <div key={item.databaseId} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-gray-950">{item.serie}</h2>
                    <StatusBadge label={item.archivedAt ? "Archivée" : item.published ? "Publiée" : "Brouillon"} tone={item.archivedAt ? "gray" : item.published ? "green" : "amber"} />
                    {!item.disponible && <StatusBadge label="Indisponible" tone="gray" />}
                    {item.landingPageMode && <StatusBadge label="Landing page" tone="green" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">/{item.slug} · {item.prix.toLocaleString("fr-FR")} FCFA · ordre {item.sortOrder}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/series/${item.databaseId}/edit`} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
                    Modifier
                  </Link>
                  {!item.archivedAt && (
                    <form action={togglePublishSeriesAction}>
                      <input type="hidden" name="id" value={item.databaseId} />
                      <input type="hidden" name="published" value={String(item.published)} />
                      <button className="rounded-full border border-green-200 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-50">
                        {item.published ? "Dépublier" : "Publier"}
                      </button>
                    </form>
                  )}
                  {item.archivedAt ? (
                    <form action={restoreSeriesAction}>
                      <input type="hidden" name="id" value={item.databaseId} />
                      <button className="rounded-full border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50">
                        Restaurer
                      </button>
                    </form>
                  ) : (
                    <form action={archiveSeriesAction}>
                      <input type="hidden" name="id" value={item.databaseId} />
                      <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
                        Archiver
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteChrome>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "green" | "amber" | "gray" }) {
  const classes = {
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    gray: "border-gray-200 bg-gray-50 text-gray-600",
  }[tone];

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${classes}`}>{label}</span>;
}
