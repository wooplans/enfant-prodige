import "server-only";

import { getSupabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export const analyticsEventTypes = [
  "session_start",
  "page_view",
  "cta_click",
  "checkout_open",
  "checkout_close",
  "checkout_details_submit",
  "scroll_depth",
  "time_on_page",
  "carousel_interaction",
  "purchase",
] as const;

export type AnalyticsEventType = (typeof analyticsEventTypes)[number];

export type AnalyticsRange = "24h" | "7d" | "30d";

type AnalyticsEventRow = {
  session_id: string;
  event_type: AnalyticsEventType;
  path: string;
  title: string | null;
  referrer: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
};

type AnalyticsSessionRow = {
  session_id: string;
  visitor_id: string | null;
  first_path: string;
  first_referrer: string | null;
  first_source: string | null;
  device_type: string;
  browser_name: string;
  country_code: string | null;
  started_at: string;
  last_seen_at: string;
};

export type AnalyticsSummary = {
  configured: boolean;
  range: AnalyticsRange;
  since: string;
  totals: {
    visitors: number;
    sessions: number;
    pageViews: number;
    ctaClicks: number;
    checkoutOpens: number;
    checkoutSubmits: number;
    purchases: number;
    revenue: number;
    averageScrollDepth: number;
    averageTimeOnPageSeconds: number;
  };
  funnel: {
    label: string;
    count: number;
    rate: number;
  }[];
  topPages: {
    path: string;
    views: number;
    ctaClicks: number;
    checkoutOpens: number;
    averageScrollDepth: number;
    averageTimeOnPageSeconds: number;
  }[];
  sources: {
    source: string;
    sessions: number;
  }[];
  devices: {
    device: string;
    sessions: number;
  }[];
  browsers: {
    browser: string;
    sessions: number;
  }[];
  recentSessions: {
    sessionId: string;
    startedAt: string;
    device: string;
    browser: string;
    source: string;
    path: string;
    events: string[];
  }[];
};

const rangeDurations: Record<AnalyticsRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const range = Array.isArray(value) ? value[0] : value;
  if (range === "24h" || range === "7d" || range === "30d") return range;
  return "7d";
}

function emptySummary(range: AnalyticsRange, since: string, configured: boolean): AnalyticsSummary {
  return {
    configured,
    range,
    since,
    totals: {
      visitors: 0,
      sessions: 0,
      pageViews: 0,
      ctaClicks: 0,
      checkoutOpens: 0,
      checkoutSubmits: 0,
      purchases: 0,
      revenue: 0,
      averageScrollDepth: 0,
      averageTimeOnPageSeconds: 0,
    },
    funnel: [
      { label: "Pages vues", count: 0, rate: 100 },
      { label: "Clics CTA", count: 0, rate: 0 },
      { label: "Checkout ouvert", count: 0, rate: 0 },
      { label: "Formulaire envoye", count: 0, rate: 0 },
      { label: "Achats confirmes", count: 0, rate: 0 },
    ],
    topPages: [],
    sources: [],
    devices: [],
    browsers: [],
    recentSessions: [],
  };
}

function increment(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function topFromMap(map: Map<string, number>, limit: number) {
  return Array.from(map.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function numericMetadata(row: AnalyticsEventRow, key: string) {
  const value = row.metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function rate(count: number, base: number) {
  if (base <= 0) return 0;
  return Math.round((count / base) * 100);
}

function sourceLabel(session: AnalyticsSessionRow) {
  return session.first_source || session.first_referrer || "Direct";
}

export async function getAnalyticsSummary(range: AnalyticsRange): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - rangeDurations[range]).toISOString();

  if (!hasSupabaseAdminConfig()) {
    return emptySummary(range, since, false);
  }

  const supabase = getSupabaseAdmin();
  const [sessionsResult, eventsResult] = await Promise.all([
    supabase
      .from("analytics_sessions")
      .select("session_id, visitor_id, first_path, first_referrer, first_source, device_type, browser_name, country_code, started_at, last_seen_at")
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(1000),
    supabase
      .from("analytics_events")
      .select("session_id, event_type, path, title, referrer, metadata, occurred_at")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: false })
      .limit(5000),
  ]);

  if (sessionsResult.error || eventsResult.error) {
    return emptySummary(range, since, true);
  }

  const sessions = (sessionsResult.data ?? []) as AnalyticsSessionRow[];
  const events = (eventsResult.data ?? []) as AnalyticsEventRow[];
  const visitors = new Set(sessions.map((session) => session.visitor_id || session.session_id));
  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const browserCounts = new Map<string, number>();
  const eventsBySession = new Map<string, AnalyticsEventRow[]>();
  const pageStats = new Map<
    string,
    {
      views: number;
      ctaClicks: number;
      checkoutOpens: number;
      scrollDepthTotal: number;
      scrollDepthCount: number;
      durationTotal: number;
      durationCount: number;
    }
  >();

  for (const session of sessions) {
    increment(sourceCounts, sourceLabel(session));
    increment(deviceCounts, session.device_type || "unknown");
    increment(browserCounts, session.browser_name || "unknown");
  }

  for (const event of events) {
    const sessionEvents = eventsBySession.get(event.session_id) ?? [];
    sessionEvents.push(event);
    eventsBySession.set(event.session_id, sessionEvents);

    const stats =
      pageStats.get(event.path) ??
      {
        views: 0,
        ctaClicks: 0,
        checkoutOpens: 0,
        scrollDepthTotal: 0,
        scrollDepthCount: 0,
        durationTotal: 0,
        durationCount: 0,
      };

    if (event.event_type === "page_view") stats.views += 1;
    if (event.event_type === "cta_click") stats.ctaClicks += 1;
    if (event.event_type === "checkout_open") stats.checkoutOpens += 1;

    const scrollDepth = numericMetadata(event, "depth");
    if (event.event_type === "scroll_depth" && scrollDepth !== null) {
      stats.scrollDepthTotal += scrollDepth;
      stats.scrollDepthCount += 1;
    }

    const durationMs = numericMetadata(event, "durationMs");
    if (event.event_type === "time_on_page" && durationMs !== null) {
      stats.durationTotal += durationMs;
      stats.durationCount += 1;
    }

    pageStats.set(event.path, stats);
  }

  const pageViews = events.filter((event) => event.event_type === "page_view").length;
  const ctaClicks = events.filter((event) => event.event_type === "cta_click").length;
  const checkoutOpens = events.filter((event) => event.event_type === "checkout_open").length;
  const checkoutSubmits = events.filter((event) => event.event_type === "checkout_details_submit").length;
  const purchaseEvents = events.filter((event) => event.event_type === "purchase");
  const purchases = purchaseEvents.length;
  const revenue = purchaseEvents.reduce((total, event) => total + (numericMetadata(event, "amount") ?? 0), 0);
  const scrollDepthEvents = events.filter((event) => event.event_type === "scroll_depth");
  const timeEvents = events.filter((event) => event.event_type === "time_on_page");
  const scrollDepthTotal = scrollDepthEvents.reduce((total, event) => total + (numericMetadata(event, "depth") ?? 0), 0);
  const timeTotal = timeEvents.reduce((total, event) => total + (numericMetadata(event, "durationMs") ?? 0), 0);

  return {
    configured: true,
    range,
    since,
    totals: {
      visitors: visitors.size,
      sessions: sessions.length,
      pageViews,
      ctaClicks,
      checkoutOpens,
      checkoutSubmits,
      purchases,
      revenue,
      averageScrollDepth: scrollDepthEvents.length ? Math.round(scrollDepthTotal / scrollDepthEvents.length) : 0,
      averageTimeOnPageSeconds: timeEvents.length ? Math.round(timeTotal / timeEvents.length / 1000) : 0,
    },
    funnel: [
      { label: "Pages vues", count: pageViews, rate: 100 },
      { label: "Clics CTA", count: ctaClicks, rate: rate(ctaClicks, pageViews) },
      { label: "Checkout ouvert", count: checkoutOpens, rate: rate(checkoutOpens, pageViews) },
      { label: "Formulaire envoye", count: checkoutSubmits, rate: rate(checkoutSubmits, pageViews) },
      { label: "Achats confirmes", count: purchases, rate: rate(purchases, pageViews) },
    ],
    topPages: Array.from(pageStats.entries())
      .map(([path, stats]) => ({
        path,
        views: stats.views,
        ctaClicks: stats.ctaClicks,
        checkoutOpens: stats.checkoutOpens,
        averageScrollDepth: stats.scrollDepthCount ? Math.round(stats.scrollDepthTotal / stats.scrollDepthCount) : 0,
        averageTimeOnPageSeconds: stats.durationCount ? Math.round(stats.durationTotal / stats.durationCount / 1000) : 0,
      }))
      .filter((page) => page.views > 0 || page.ctaClicks > 0 || page.checkoutOpens > 0)
      .sort((left, right) => right.views - left.views)
      .slice(0, 8),
    sources: topFromMap(sourceCounts, 8).map(([source, count]) => ({ source, sessions: count })),
    devices: topFromMap(deviceCounts, 5).map(([device, count]) => ({ device, sessions: count })),
    browsers: topFromMap(browserCounts, 5).map(([browser, count]) => ({ browser, sessions: count })),
    recentSessions: sessions.slice(0, 8).map((session) => {
      const sessionEvents = (eventsBySession.get(session.session_id) ?? [])
        .sort((left, right) => new Date(left.occurred_at).getTime() - new Date(right.occurred_at).getTime());

      return {
        sessionId: session.session_id,
        startedAt: session.started_at,
        device: session.device_type || "unknown",
        browser: session.browser_name || "unknown",
        source: sourceLabel(session),
        path: session.first_path,
        events: sessionEvents.slice(0, 6).map((event) => `${event.event_type} ${event.path}`),
      };
    }),
  };
}
