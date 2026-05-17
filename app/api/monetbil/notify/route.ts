import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isMissingTableError } from "@/lib/supabase-errors";
import {
  buildMonetbilToken,
  extractMonetbilPaymentRef,
  extractMonetbilTransactionRef,
  getMonetbilConfig,
  monetbilNotificationSchema,
  normalizeMonetbilStatus,
} from "@/lib/monetbil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readNotificationBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const raw = await request.text();

  if (!raw.trim()) {
    return {};
  }

  if (contentType.includes("application/json") || raw.trim().startsWith("{")) {
    return JSON.parse(raw) as Record<string, unknown>;
  }

  return Object.fromEntries(new URLSearchParams(raw).entries()) as Record<string, unknown>;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await readNotificationBody(request);
  } catch {
    return NextResponse.json({ ok: false, message: "Notification invalide." }, { status: 400 });
  }

  const parsed = monetbilNotificationSchema.safeParse(payload);
  const query = new URL(request.url).searchParams;
  const notificationPayload = (parsed.success ? parsed.data : payload) as Record<string, unknown>;
  const paymentRef =
    extractMonetbilPaymentRef(notificationPayload, query.get("payment_ref")) ||
    query.get("payment_ref");

  if (!paymentRef) {
    return NextResponse.json({ ok: false, message: "payment_ref manquant." }, { status: 400 });
  }

  const { serviceSecret } = getMonetbilConfig();
  const expectedToken = buildMonetbilToken(paymentRef, serviceSecret);
  const providedToken = query.get("token");

  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json({ ok: false, message: "Token de notification invalide." }, { status: 401 });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;

  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Configuration Supabase manquante.",
      },
      { status: 500 }
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("payment_orders")
    .select("payment_ref, status, monetbil_transaction_ref, series_slug, paid_at, amount")
    .eq("payment_ref", paymentRef)
    .maybeSingle();

  if (fetchError) {
    if (isMissingTableError(fetchError, "payment_orders")) {
      console.warn("payment_orders table missing during Monetbil notification fetch", fetchError.message);
      return NextResponse.json({ ok: true, status: "pending", payment_ref: paymentRef, persisted: false });
    }

    return NextResponse.json(
      { ok: false, message: `Commande introuvable: ${fetchError.message}` },
      { status: 500 }
    );
  }

  if (!existing) {
    return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
  }

  const notificationStatus =
    (notificationPayload.status as string | undefined) ??
    (notificationPayload.state as string | undefined) ??
    (notificationPayload.payment_status as string | undefined);
  const status = normalizeMonetbilStatus(notificationStatus);
  const transactionRef = extractMonetbilTransactionRef(notificationPayload);
  const now = new Date().toISOString();

  if (existing.status === "paid" && status === "paid" && existing.monetbil_transaction_ref === transactionRef) {
    return NextResponse.json({ ok: true, status: "paid", idempotent: true });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    notification_payload: notificationPayload,
    updated_at: now,
  };

  if (transactionRef) {
    updatePayload.monetbil_transaction_ref = transactionRef;
  }

  if (status === "paid" && !existing.paid_at) {
    updatePayload.paid_at = now;
  }

  if (status === "failed") {
    updatePayload.failed_at = now;
  }

  if (status === "expired") {
    updatePayload.expired_at = now;
  }

  const { error: updateError } = await supabase
    .from("payment_orders")
    .update(updatePayload)
    .eq("payment_ref", paymentRef);

  if (updateError) {
    if (isMissingTableError(updateError, "payment_orders")) {
      console.warn("payment_orders table missing during Monetbil notification update", updateError.message);
      return NextResponse.json({ ok: true, status, payment_ref: paymentRef, persisted: false });
    }

    return NextResponse.json(
      { ok: false, message: `Mise à jour impossible: ${updateError.message}` },
      { status: 500 }
    );
  }

  if (status === "paid" && !existing.paid_at) {
    void supabase.from("analytics_events").insert({
      session_id: paymentRef,
      event_type: "purchase",
      path: existing.series_slug ? `/bd/${existing.series_slug}` : "/paiement/retour",
      title: null,
      referrer: null,
      metadata: {
        seriesSlug: existing.series_slug ?? null,
        amount: existing.amount ?? null,
        currency: "XAF",
        provider: "monetbil",
      },
      occurred_at: now,
    });
  }

  if (existing.series_slug) {
    revalidatePath(`/bd/${existing.series_slug}`);
  }
  revalidatePath("/catalogue");
  revalidatePath("/");

  return NextResponse.json({ ok: true, status, payment_ref: paymentRef });
}
