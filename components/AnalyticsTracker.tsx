"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export type ClientAnalyticsEventType =
  | "session_start"
  | "page_view"
  | "cta_click"
  | "checkout_open"
  | "checkout_close"
  | "checkout_details_submit"
  | "scroll_depth"
  | "time_on_page"
  | "carousel_interaction";

type TrackOptions = {
  eventType: ClientAnalyticsEventType;
  path?: string;
  title?: string;
  referrer?: string | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

const sessionKey = "ep_analytics_session_id";
const sessionStartedKey = "ep_analytics_session_started";
const visitorKey = "ep_analytics_visitor_id";
const endpoint = "/api/analytics/track";

function randomId(prefix: string) {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${random}`;
}

function isTrackablePath(path: string) {
  return !path.startsWith("/admin") && !path.startsWith("/api") && !path.startsWith("/_next") && !path.includes(".");
}

function getSessionId() {
  let sessionId = window.sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = randomId("ses");
    window.sessionStorage.setItem(sessionKey, sessionId);
  }
  return sessionId;
}

function getVisitorId() {
  let visitorId = window.localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = randomId("vis");
    window.localStorage.setItem(visitorKey, visitorId);
  }
  return visitorId;
}

const fbclidKey = "ep_fbclid";

function captureFbclid() {
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (fbclid) window.sessionStorage.setItem(fbclidKey, fbclid);
}

function getUtm() {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid") || window.sessionStorage.getItem(fbclidKey) || undefined;
  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    term: params.get("utm_term") || undefined,
    content: params.get("utm_content") || undefined,
    fbclid,
  };
}

function cleanMetadata(metadata: TrackOptions["metadata"]) {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (value === null || value === undefined) continue;
    clean[key] = value;
  }
  return clean;
}

export function trackAnalyticsEvent(options: TrackOptions) {
  if (typeof window === "undefined") return;

  const path = options.path ?? `${window.location.pathname}${window.location.search}`;
  if (!isTrackablePath(window.location.pathname)) return;

  const payload = {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    eventType: options.eventType,
    path,
    referrer: options.referrer ?? document.referrer ?? null,
    title: options.title ?? document.title ?? null,
    utm: getUtm(),
    metadata: cleanMetadata(options.metadata),
    occurredAt: new Date().toISOString(),
  };
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartedAt = useRef(0);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
    if (!isTrackablePath(pathname)) return;

    if (lastPath.current) {
      trackAnalyticsEvent({
        eventType: "time_on_page",
        path: lastPath.current,
        metadata: { durationMs: Date.now() - pageStartedAt.current },
      });
    }

    pageStartedAt.current = Date.now();
    lastPath.current = fullPath;
    captureFbclid();

    if (window.sessionStorage.getItem(sessionStartedKey) !== "1") {
      window.sessionStorage.setItem(sessionStartedKey, "1");
      trackAnalyticsEvent({ eventType: "session_start", path: fullPath });
    }

    trackAnalyticsEvent({ eventType: "page_view", path: fullPath });

    const reached = new Set<number>();
    const thresholds = [25, 50, 75, 90];
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      for (const threshold of thresholds) {
        if (depth >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          trackAnalyticsEvent({
            eventType: "scroll_depth",
            path: fullPath,
            metadata: { depth: threshold },
          });
        }
      }
    };

    const onPageHide = () => {
      trackAnalyticsEvent({
        eventType: "time_on_page",
        path: fullPath,
        metadata: { durationMs: Date.now() - pageStartedAt.current },
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname, searchParams]);

  return null;
}
