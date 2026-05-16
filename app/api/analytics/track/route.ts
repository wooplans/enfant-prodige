import { NextResponse } from "next/server";
import { z } from "zod";
import { analyticsEventTypes } from "@/lib/analytics";
import { isMissingTableError } from "@/lib/supabase-errors";
import { getSupabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const metadataSchema = z.record(z.string(), z.unknown()).optional().default({});
const utmSchema = z
  .object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  })
  .optional()
  .default({});

const analyticsPayloadSchema = z.object({
  sessionId: z.string().min(12).max(96),
  visitorId: z.string().min(12).max(96).optional(),
  eventType: z.enum(analyticsEventTypes),
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  utm: utmSchema,
  metadata: metadataSchema,
  occurredAt: z.string().datetime().optional(),
});

const allowedMetadataKeys = new Set([
  "source",
  "placement",
  "label",
  "href",
  "seriesId",
  "seriesSlug",
  "seriesTitle",
  "provider",
  "depth",
  "durationMs",
  "slideIndex",
  "slideLabel",
]);

const blockedMetadataPattern = /(name|prenom|pr\u00e9nom|phone|tel|email|mail|address|adresse|quartier|rue|payment|card|token|secret)/i;

function shouldIgnorePath(path: string) {
  const pathname = (() => {
    try {
      return new URL(path, "https://local.invalid").pathname;
    } catch {
      return path.split("?")[0] || path;
    }
  })();

  return (
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/api") && pathname !== "/api/analytics/track") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  );
}

function trimText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function sanitizeUtm(utm: Record<string, unknown>) {
  return {
    source: trimText(utm.source, 80),
    medium: trimText(utm.medium, 80),
    campaign: trimText(utm.campaign, 120),
    term: trimText(utm.term, 120),
    content: trimText(utm.content, 120),
  };
}

function sanitizeMetadata(metadata: Record<string, unknown>) {
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (!allowedMetadataKeys.has(key) || blockedMetadataPattern.test(key)) continue;

    if (typeof value === "string") {
      clean[key] = value.slice(0, 160);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === "boolean") {
      clean[key] = value;
    }
  }

  return clean;
}

function getDeviceType(userAgent: string) {
  const lower = userAgent.toLowerCase();
  if (/(bot|crawler|spider|preview|facebookexternalhit|whatsapp)/.test(lower)) return "bot";
  if (/(ipad|tablet)/.test(lower)) return "tablet";
  if (/(mobi|android|iphone|ipod)/.test(lower)) return "mobile";
  if (userAgent) return "desktop";
  return "unknown";
}

function getBrowserName(userAgent: string) {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/OPR\//.test(userAgent)) return "Opera";
  return userAgent ? "Other" : "unknown";
}

function firstSource(referrer: string | null, utm: Record<string, string | null>) {
  if (utm.source) return utm.source;
  if (!referrer) return "Direct";

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Referrer";
  }
}

async function readPayload(request: Request) {
  const raw = await request.text();
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const parsed = analyticsPayloadSchema.safeParse(await readPayload(request));
  if (!parsed.success || shouldIgnorePath(parsed.data.path)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const occurredAt = parsed.data.occurredAt ?? now;
  const headers = request.headers;
  const userAgent = headers.get("user-agent") ?? "";
  const countryCode =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code") ||
    null;
  const referrer = trimText(parsed.data.referrer, 500);
  const title = trimText(parsed.data.title, 200);
  const utm = sanitizeUtm(parsed.data.utm);
  const metadata = sanitizeMetadata(parsed.data.metadata);

  const sessionInsert = await supabase.from("analytics_sessions").upsert(
    {
        session_id: parsed.data.sessionId,
        visitor_id: parsed.data.visitorId ?? null,
        first_path: parsed.data.path,
        first_referrer: referrer,
        first_source: firstSource(referrer, utm),
        utm,
        device_type: getDeviceType(userAgent),
        browser_name: getBrowserName(userAgent),
        country_code: countryCode,
        started_at: occurredAt,
        last_seen_at: occurredAt,
        updated_at: now,
      },
    { onConflict: "session_id", ignoreDuplicates: true }
  );

  if (sessionInsert.error) {
    if (
      isMissingTableError(sessionInsert.error, "analytics_sessions") ||
      isMissingTableError(sessionInsert.error, "analytics_events")
    ) {
      console.warn("Analytics tables missing during session upsert", sessionInsert.error.message);
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: false, message: sessionInsert.error.message }, { status: 500 });
  }

  const sessionUpdate = await supabase
    .from("analytics_sessions")
    .update({ last_seen_at: occurredAt, updated_at: now })
    .eq("session_id", parsed.data.sessionId);

  if (sessionUpdate.error) {
    if (isMissingTableError(sessionUpdate.error, "analytics_sessions")) {
      console.warn("analytics_sessions table missing during session update", sessionUpdate.error.message);
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: false, message: sessionUpdate.error.message }, { status: 500 });
  }

  const { error: eventError } = await supabase.from("analytics_events").insert({
    session_id: parsed.data.sessionId,
    event_type: parsed.data.eventType,
    path: parsed.data.path,
    title,
    referrer,
    utm,
    metadata,
    occurred_at: occurredAt,
  });

  if (eventError) {
    if (isMissingTableError(eventError, "analytics_events")) {
      console.warn("analytics_events table missing during event insert", eventError.message);
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: false, message: eventError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
