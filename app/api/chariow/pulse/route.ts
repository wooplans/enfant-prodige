import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { getPaymentSettings } from "@/lib/payment-settings";
import { isMissingTableError } from "@/lib/supabase-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeChariowStatus(value: string | undefined | null) {
  const lower = (value || "").toLowerCase();

  if (["successful sale", "successful_sale", "sale_success", "success", "paid", "completed", "complete"].includes(lower)) {
    return "paid" as const;
  }

  if (["failed sale", "failed_sale", "failed", "error", "cancelled", "canceled", "aborted", "refunded"].includes(lower)) {
    return "failed" as const;
  }

  if (["expired", "timeout", "timed_out"].includes(lower)) {
    return "expired" as const;
  }

  return "pending" as const;
}

async function readPayload(request: Request) {
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

function asText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await readPayload(request);
  } catch {
    return NextResponse.json({ ok: false, message: "Webhook Chariow invalide." }, { status: 400 });
  }

  const canPersist = hasSupabaseAdminConfig();
  const supabase = canPersist ? getSupabaseAdmin() : null;
  const paymentSettings = await getPaymentSettings();
  const purchase = asRecord(payload.purchase);
  const payment = asRecord(payload.payment);
  const customMetadata = asRecord(payload.custom_metadata) ?? asRecord(purchase?.custom_metadata);
  const status = normalizeChariowStatus(
    asText(payload.event) ||
      asText(payload.status) ||
      asText(payload.state) ||
      asText(payload.sale_status) ||
      asText(purchase?.status) ||
      asText(payment?.status)
  );
  const productCode =
    asText(payload.product_code) ||
    asText(payload.productCode) ||
    asText(payload.product_ref) ||
    asText(payload.productRef) ||
    asText(purchase?.product_id) ||
    asText(purchase?.product_code) ||
    paymentSettings.chariowProductCode;
  const externalReference =
    asText(payload.order_ref) ||
    asText(payload.orderRef) ||
    asText(payload.reference) ||
    asText(payload.transaction_id) ||
    asText(payload.transactionId) ||
    asText(purchase?.id) ||
    asText(payment?.transaction_id);
  const paymentRef =
    asText(payload.payment_ref) ||
    asText(payload.paymentRef) ||
    asText(customMetadata?.payment_ref) ||
    asText(customMetadata?.paymentRef);
  const now = new Date().toISOString();

  if (!supabase) {
    return NextResponse.json({ ok: true, status, provider: "chariow", persisted: false });
  }

  let targetOrder = null as
    | {
        payment_ref: string;
        series_slug: string;
        status: string;
        provider_order_ref: string | null;
        provider_product_code: string | null;
        paid_at: string | null;
      }
    | null;

  if (paymentRef) {
    const { data, error } = await supabase
      .from("payment_orders")
      .select("payment_ref, series_slug, status, provider_order_ref, provider_product_code, paid_at")
      .eq("payment_ref", paymentRef)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error, "payment_orders")) {
        console.warn("payment_orders table missing during Chariow webhook fetch", error.message);
        return NextResponse.json({ ok: true, status, provider: "chariow", persisted: false });
      }

      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    targetOrder = data ?? null;
  }

  if (!targetOrder) {
    const { data, error } = await supabase
      .from("payment_orders")
      .select("payment_ref, series_slug, status, provider_order_ref, provider_product_code, paid_at")
      .eq("provider", "chariow")
      .eq("provider_product_code", productCode)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error, "payment_orders")) {
        console.warn("payment_orders table missing during Chariow webhook lookup", error.message);
        return NextResponse.json({ ok: true, status, provider: "chariow", persisted: false });
      }

      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    targetOrder = data ?? null;
  }

  if (!targetOrder) {
    return NextResponse.json({ ok: false, message: "Commande Chariow introuvable." }, { status: 404 });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    provider: "chariow",
    provider_product_code: productCode,
    provider_order_ref: externalReference || targetOrder.provider_order_ref,
    provider_payload: payload,
    notification_payload: payload,
    updated_at: now,
  };

  if (externalReference) {
    updatePayload.provider_order_ref = externalReference;
  }

  if (status === "paid" && !targetOrder.paid_at) {
    updatePayload.paid_at = now;
  }

  if (status === "failed") {
    updatePayload.failed_at = now;
  }

  if (status === "expired") {
    updatePayload.expired_at = now;
  }

  const { error } = await supabase
    .from("payment_orders")
    .update(updatePayload)
    .eq("payment_ref", targetOrder.payment_ref);

  if (error) {
    if (isMissingTableError(error, "payment_orders")) {
      console.warn("payment_orders table missing during Chariow webhook update", error.message);
      return NextResponse.json({ ok: true, status, provider: "chariow", persisted: false });
    }

    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  revalidatePath(`/bd/${targetOrder.series_slug}`);
  revalidatePath("/catalogue");
  revalidatePath("/");

  return NextResponse.json({
    ok: true,
    status,
    provider: "chariow",
    payment_ref: targetOrder.payment_ref,
    provider_order_ref: externalReference,
  });
}
