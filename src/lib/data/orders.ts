import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/database";
import type { PublicOrder, OrderSummaryItem } from "@/types/catalog";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const paymentStatuses: PaymentStatus[] = [
  "unpaid",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
];

const paymentMethods: PaymentMethod[] = [
  "cod",
  "bank_transfer",
  "card",
  "advance",
  "jazzcash",
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseItems(value: unknown): OrderSummaryItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const item = asRecord(entry);
    if (!item) return [];
    return [
      {
        productName: asString(item.product_name, "Product"),
        productSku: typeof item.product_sku === "string" ? item.product_sku : null,
        quantity: asNumber(item.quantity, 1),
        unitPrice: asNumber(item.unit_price),
        lineTotal: asNumber(item.line_total),
      },
    ];
  });
}

export function parsePublicOrder(value: unknown): PublicOrder | null {
  const record = asRecord(value);
  if (!record) return null;
  const orderNumber = asString(record.order_number);
  if (!orderNumber) return null;

  const status = asString(record.status, "pending") as OrderStatus;
  const paymentStatus = asString(record.payment_status, "unpaid") as PaymentStatus;
  const paymentMethod = asString(record.payment_method, "cod") as PaymentMethod;

  const timelineValue = Array.isArray(record.timeline) ? record.timeline : [];
  const timeline = timelineValue.flatMap((entry) => {
    const item = asRecord(entry);
    if (!item) return [];
    const itemStatus = asString(item.status) as OrderStatus;
    if (!orderStatuses.includes(itemStatus)) return [];
    return [{ status: itemStatus, at: typeof item.at === "string" ? item.at : null }];
  });

  return {
    orderNumber,
    status: orderStatuses.includes(status) ? status : "pending",
    paymentMethod: paymentMethods.includes(paymentMethod) ? paymentMethod : "cod",
    paymentStatus: paymentStatuses.includes(paymentStatus) ? paymentStatus : "unpaid",
    customerName: asString(record.customer_name),
    city: asString(record.city),
    subtotal: asNumber(record.subtotal),
    discountTotal: asNumber(record.discount_total),
    deliveryFee: asNumber(record.delivery_fee),
    grandTotal: asNumber(record.grand_total),
    currency: asString(record.currency, "PKR"),
    placedAt: asString(record.placed_at),
    items: parseItems(record.items),
    timeline,
  };
}

export async function getOrderByToken(orderNumber: string, token: string) {
  if (!isSupabaseConfigured()) return { order: null, configured: false };

  const supabase = await createClient();
  if (!supabase) return { order: null, configured: false };

  const { data, error } = await supabase.rpc("get_order_by_token", {
    p_order_number: orderNumber,
    p_token: token,
  });

  if (error) return { order: null, configured: true };
  return { order: parsePublicOrder(data), configured: true };
}

export async function trackOrder(orderNumber: string, phone: string) {
  if (!isSupabaseConfigured()) {
    return {
      order: null,
      message:
        "Order lookup requires the Supabase backend. This preview is running from the seed catalog.",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { order: null, message: "The store database is not reachable right now." };
  }

  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: orderNumber,
    p_phone: phone,
  });

  if (error) {
    return {
      order: null,
      message: error.message || "No order matched those details.",
    };
  }

  const order = parsePublicOrder(data);
  if (!order) {
    return {
      order: null,
      message: "No order matched those details. Check the reference and phone number.",
    };
  }

  return { order, message: null };
}
