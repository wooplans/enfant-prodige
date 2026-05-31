import "server-only";

import { z } from "zod";
import { getSupabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export const paymentProviderSchema = z.enum(["chariow", "monetbil"]);

export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export type PaymentSettings = {
  defaultProvider: PaymentProvider;
  monetbilEnabled: boolean;
  chariowProductCode: string;
  chariowProductUrl: string;
  chariowSnapSnippet: string;
};

export type PaymentSettingsFormState = {
  ok: boolean;
  message: string;
};

type PaymentSettingsRow = Record<string, unknown> & {
  defaultProvider?: PaymentProvider;
  default_provider?: PaymentProvider;
  monetbilEnabled?: boolean;
  monetbil_enabled?: boolean;
  chariowProductCode?: string;
  chariow_product_code?: string;
  chariowProductUrl?: string;
  chariow_product_url?: string;
  chariowSnapSnippet?: string;
  chariow_snap_snippet?: string;
};

export const paymentSettingsSchema = z.object({
  defaultProvider: paymentProviderSchema,
  monetbilEnabled: z.boolean(),
  chariowProductCode: z.string().min(1),
  chariowProductUrl: z.string().url(),
  chariowSnapSnippet: z.string(),
});

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  defaultProvider: "chariow",
  monetbilEnabled: false,
  chariowProductCode: process.env.CHARIOW_PRODUCT_CODE?.trim() || "prd_k4bjo5",
  chariowProductUrl: process.env.CHARIOW_PRODUCT_URL?.trim() || "https://enfantprodige.mychariow.shop/prd_k4bjo5",
  chariowSnapSnippet:
    process.env.CHARIOW_SNAP_SNIPPET?.trim() ||
    `<div id="chariow-widget" data-product-id="prd_k4bjo5"
    data-store-domain="enfantprodige.mychariow.shop"
    data-style="frame"
    data-border-style="rounded"
    data-cta-width="xs"
    data-cta-animation="none"
    data-locale="fr"
    data-background-color="#FFFFFF"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://js.chariowcdn.com/v1/widget.min.js';
  script.async = true;
  document.head.appendChild(script);

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://js.chariowcdn.com/v1/widget.min.css';
  document.head.appendChild(link);
})();
</script>`,
};

function normalizePaymentSettingsRow(row: PaymentSettingsRow | null | undefined): PaymentSettings {
  const providerCandidate = row?.defaultProvider ?? row?.default_provider ?? DEFAULT_PAYMENT_SETTINGS.defaultProvider;
  const provider = paymentProviderSchema.safeParse(providerCandidate).success
    ? (providerCandidate as PaymentProvider)
    : DEFAULT_PAYMENT_SETTINGS.defaultProvider;

  return {
    defaultProvider: provider,
    monetbilEnabled: Boolean(row?.monetbilEnabled ?? row?.monetbil_enabled ?? DEFAULT_PAYMENT_SETTINGS.monetbilEnabled),
    chariowProductCode: String(row?.chariowProductCode ?? row?.chariow_product_code ?? DEFAULT_PAYMENT_SETTINGS.chariowProductCode),
    chariowProductUrl: String(row?.chariowProductUrl ?? row?.chariow_product_url ?? DEFAULT_PAYMENT_SETTINGS.chariowProductUrl),
    chariowSnapSnippet: String(row?.chariowSnapSnippet ?? row?.chariow_snap_snippet ?? DEFAULT_PAYMENT_SETTINGS.chariowSnapSnippet),
  };
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  if (!hasSupabaseAdminConfig()) {
    return DEFAULT_PAYMENT_SETTINGS;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payment_settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_PAYMENT_SETTINGS;
  }

  return normalizePaymentSettingsRow(data as Partial<PaymentSettings>);
}

export async function upsertPaymentSettings(settings: PaymentSettings) {
  const supabase = getSupabaseAdmin();
  const payload = {
    id: "global",
    default_provider: settings.defaultProvider,
    monetbil_enabled: settings.monetbilEnabled,
    chariow_product_code: settings.chariowProductCode,
    chariow_product_url: settings.chariowProductUrl,
    chariow_snap_snippet: settings.chariowSnapSnippet,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("payment_settings").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export function resolveActivePaymentProvider(settings: PaymentSettings): PaymentProvider {
  if (settings.defaultProvider === "monetbil" && settings.monetbilEnabled) {
    return "monetbil";
  }

  return "chariow";
}

export function sanitizeChariowHtml(snippet: string) {
  return snippet.trim();
}
