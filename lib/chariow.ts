import "server-only";

function sanitizePhoneNumber(value: string) {
  return value.replace(/\D+/g, "");
}

export function hasChariowApiKey() {
  return Boolean(process.env.CHARIOW_API_KEY?.trim());
}

export function buildChariowReturnUrl(requestUrl: string, paymentRef: string, slug: string) {
  const baseUrl = new URL(requestUrl).origin.replace(/\/$/, "");
  return `${baseUrl}/paiement/retour?bd=${encodeURIComponent(slug)}&payment_ref=${encodeURIComponent(paymentRef)}`;
}

export async function createChariowCheckout(options: {
  requestUrl: string;
  productId: string;
  paymentRef: string;
  slug: string;
  prenom: string;
  email: string;
  telephone: string;
  quartier: string;
  rue?: string;
  discountCode?: string;
}) {
  const apiKey = process.env.CHARIOW_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("CHARIOW_API_KEY manquant.");
  }

  const redirectUrl = buildChariowReturnUrl(options.requestUrl, options.paymentRef, options.slug);
  const phoneNumber = sanitizePhoneNumber(options.telephone);
  const address = options.rue?.trim()
    ? `${options.quartier.trim()}, ${options.rue.trim()}`
    : options.quartier.trim();

  const payload = {
    product_id: options.productId,
    email: options.email.trim().toLowerCase(),
    first_name: options.prenom.trim(),
    last_name: "Client",
    phone: {
      number: phoneNumber,
      country_code: "CM",
    },
    redirect_url: redirectUrl,
    ...(options.discountCode?.trim() ? { discount_code: options.discountCode.trim() } : {}),
    custom_metadata: {
      payment_ref: options.paymentRef,
      series_slug: options.slug,
      quartier: options.quartier.trim().slice(0, 100),
    },
    address: address.slice(0, 255),
    city: options.quartier.trim().slice(0, 100),
    state: options.quartier.trim().slice(0, 100),
    country: "CM",
    zip: "00000",
  };

  const response = await fetch("https://api.chariow.com/v1/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const responseText = await response.text();
  let parsed: ChariowCheckoutResponse;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`Réponse Chariow invalide: ${responseText.slice(0, 180)}`);
  }

  if (!response.ok) {
    const fieldErrors = parsed?.errors && typeof parsed.errors === "object"
      ? Object.values(parsed.errors as Record<string, unknown[]>)
          .flat()
          .find((value) => typeof value === "string")
      : null;

    throw new Error(
      (typeof fieldErrors === "string" && fieldErrors) ||
        parsed?.message ||
        `Chariow a refusé la demande (${response.status}).`
    );
  }

  const checkoutUrl = parsed?.data?.payment?.checkout_url;
  const saleId = parsed?.data?.purchase?.id ?? null;
  const step = parsed?.data?.step ?? null;

  if (step === "completed" || step === "already_purchased") {
    return {
      checkoutUrl: redirectUrl,
      redirectUrl,
      saleId,
      step,
      raw: parsed,
      requestPayload: payload,
    };
  }

  if ((step !== "payment" && step !== "awaiting_payment") || typeof checkoutUrl !== "string" || !checkoutUrl.trim()) {
    throw new Error(parsed?.data?.message || parsed?.message || "Chariow n'a pas renvoye d'URL de paiement.");
  }

  return {
    checkoutUrl,
    redirectUrl,
    saleId,
    step,
    raw: parsed,
    requestPayload: payload,
  };
}
type ChariowCheckoutResponse = {
  message?: string | null;
  errors?: Record<string, unknown[]>;
  data?: {
    step?: string | null;
    message?: string | null;
    purchase?: {
      id?: string | null;
    } | null;
    payment?: {
      checkout_url?: string | null;
    } | null;
  } | null;
};
