import type { PaymentSettings } from "@/types/catalog";

export const checkoutPaymentMethods = ["cod", "advance", "jazzcash"] as const;

export type CheckoutPaymentMethod = (typeof checkoutPaymentMethods)[number];

export type PaymentOption = {
  code: CheckoutPaymentMethod;
  label: string;
  description: string;
  details: string | null;
  requiresReceipt: boolean;
};

export const paymentMethodLabels: Record<CheckoutPaymentMethod, string> = {
  cod: "Cash on delivery",
  advance: "Advance payment",
  jazzcash: "JazzCash",
};

export const paymentReceiptMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const defaultPaymentSettings: PaymentSettings = {
  advance: { enabled: false, details: "" },
  jazzcash: { enabled: false, details: "" },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readPaymentMethod(value: unknown) {
  const record = asRecord(value);
  return {
    enabled: record?.enabled === true,
    details: typeof record?.details === "string" ? record.details : "",
  };
}

export function paymentSettingsFromSocials(socials: unknown): PaymentSettings {
  const root = asRecord(socials);
  const payments = asRecord(root?.payments);

  return {
    advance: readPaymentMethod(payments?.advance),
    jazzcash: readPaymentMethod(payments?.jazzcash),
  };
}

export function isCheckoutPaymentMethod(value: string): value is CheckoutPaymentMethod {
  return checkoutPaymentMethods.includes(value as CheckoutPaymentMethod);
}

export function paymentMethodLabel(value: string) {
  if (value === "bank_transfer" || value === "card") return "Advance payment";
  if (isCheckoutPaymentMethod(value)) return paymentMethodLabels[value];
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function paymentRequiresReceipt(method: CheckoutPaymentMethod) {
  return method !== "cod";
}

export function getPaymentOptions({
  codEnabled,
  payments,
}: {
  codEnabled: boolean;
  payments: PaymentSettings;
}): PaymentOption[] {
  const options: PaymentOption[] = [];

  if (codEnabled) {
    options.push({
      code: "cod",
      label: paymentMethodLabels.cod,
      description: "Pay the courier in cash when your parcel arrives.",
      details: null,
      requiresReceipt: false,
    });
  }

  if (payments.advance.enabled) {
    options.push({
      code: "advance",
      label: paymentMethodLabels.advance,
      description:
        "Pay using the card or bank details below, then upload a screenshot or photo of your payment receipt.",
      details: payments.advance.details || null,
      requiresReceipt: true,
    });
  }

  if (payments.jazzcash.enabled) {
    options.push({
      code: "jazzcash",
      label: paymentMethodLabels.jazzcash,
      description:
        "Send the payment to the JazzCash account below, then upload a screenshot or photo of your receipt.",
      details: payments.jazzcash.details || null,
      requiresReceipt: true,
    });
  }

  return options;
}

export function validatePaymentReceipt(file: File) {
  if (!paymentReceiptMimeTypes.includes(file.type as (typeof paymentReceiptMimeTypes)[number])) {
    return "Upload a JPG, PNG, WebP or AVIF image of your payment receipt.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Payment receipts must be smaller than 5 MB.";
  }
  return null;
}
