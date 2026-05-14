import Link from "next/link";
import type { AnalyticsRange, AnalyticsSummary } from "@/lib/analytics";

type Props = {
  summary: AnalyticsSummary;
};

const rangeLabels: Record<AnalyticsRange, string> = {
  "24h": "24h",
  "7d": "7 jours",
  "30d": "30 jours",
};

const ranges: AnalyticsRange[] = ["24h", "7d", "30d"];

function formatNumber(value: number) {
  return value.toLocaleString("fr-FR");
}

function formatSeconds(value: number) {
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}m ${seconds}s`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminAnalyticsPanel({ summary }: Props) {
  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Analytics visiteurs</p>
            <h2 className="text-2xl font-extrabold text-gray-950">Comportement sur le site</h2>
            <p className="mt-1 text-sm text-gray-600">
              Donnees anonymes: sessions, pages, CTA, scroll, temps passe et tunnel checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ranges.map((range) => (
              <Link
                key={range}
                href={`/admin?analyticsRange=${range}`}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  summary.range === range
                    ? "border-green-700 bg-green-700 text-white"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {rangeLabels[range]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {!summary.configured ? (
        <div className="p-5 text-sm text-amber-800">
          Configurez Supabase admin pour activer les analytics internes.
        </div>
      ) : (
        <div className="space-y-6 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Visiteurs" value={formatNumber(summary.totals.visitors)} />
            <Metric label="Sessions" value={formatNumber(summary.totals.sessions)} />
            <Metric label="Pages vues" value={formatNumber(summary.totals.pageViews)} />
            <Metric label="Clics CTA" value={formatNumber(summary.totals.ctaClicks)} />
            <Metric label="Checkout ouverts" value={formatNumber(summary.totals.checkoutOpens)} />
            <Metric label="Formulaires envoyes" value={formatNumber(summary.totals.checkoutSubmits)} />
            <Metric label="Scroll moyen" value={`${summary.totals.averageScrollDepth}%`} />
            <Metric label="Temps moyen/page" value={formatSeconds(summary.totals.averageTimeOnPageSeconds)} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-gray-100">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="font-extrabold text-gray-950">Tunnel comportemental</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {summary.funnel.map((step) => (
                  <div key={step.label} className="grid gap-3 px-4 py-3 sm:grid-cols-[160px_1fr_80px] sm:items-center">
                    <div className="text-sm font-bold text-gray-800">{step.label}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-green-600" style={{ width: `${Math.min(100, step.rate)}%` }} />
                    </div>
                    <div className="text-sm font-bold text-gray-950">
                      {formatNumber(step.count)} <span className="text-gray-500">({step.rate}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <SmallList title="Sources" rows={summary.sources.map((row) => [row.source, row.sessions])} />
              <SmallList title="Appareils" rows={summary.devices.map((row) => [row.device, row.sessions])} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="font-extrabold text-gray-950">Pages principales</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Page</th>
                      <th className="px-4 py-3">Vues</th>
                      <th className="px-4 py-3">CTA</th>
                      <th className="px-4 py-3">Checkout</th>
                      <th className="px-4 py-3">Scroll</th>
                      <th className="px-4 py-3">Temps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.topPages.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-gray-500" colSpan={6}>
                          Aucun evenement sur cette periode.
                        </td>
                      </tr>
                    ) : (
                      summary.topPages.map((page) => (
                        <tr key={page.path}>
                          <td className="max-w-[280px] truncate px-4 py-3 font-semibold text-gray-900">{page.path}</td>
                          <td className="px-4 py-3">{formatNumber(page.views)}</td>
                          <td className="px-4 py-3">{formatNumber(page.ctaClicks)}</td>
                          <td className="px-4 py-3">{formatNumber(page.checkoutOpens)}</td>
                          <td className="px-4 py-3">{page.averageScrollDepth}%</td>
                          <td className="px-4 py-3">{formatSeconds(page.averageTimeOnPageSeconds)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <SmallList title="Navigateurs" rows={summary.browsers.map((row) => [row.browser, row.sessions])} />
          </div>

          <div className="rounded-2xl border border-gray-100">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="font-extrabold text-gray-950">Sessions recentes anonymes</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {summary.recentSessions.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-500">Aucune session sur cette periode.</div>
              ) : (
                summary.recentSessions.map((session) => (
                  <div key={session.sessionId} className="grid gap-2 px-4 py-4 lg:grid-cols-[180px_1fr]">
                    <div>
                      <div className="text-sm font-bold text-gray-950">{formatDate(session.startedAt)}</div>
                      <div className="text-xs text-gray-500">
                        {session.device} - {session.browser} - {session.source}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{session.path}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {session.events.map((event, index) => (
                          <span key={`${session.sessionId}-${index}`} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
      <div className="text-sm font-semibold text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-gray-950">{value}</div>
    </div>
  );
}

function SmallList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-2xl border border-gray-100">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="font-extrabold text-gray-950">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-500">Aucune donnee.</div>
        ) : (
          rows.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="truncate font-semibold text-gray-800">{label}</span>
              <span className="font-bold text-gray-950">{formatNumber(count)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
