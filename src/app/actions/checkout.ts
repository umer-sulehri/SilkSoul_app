"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/schemas";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

export type CheckoutActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function parseItems(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || !value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export async function placeOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const requestHeaders = await headers();
  const limiter = rateLimit(getClientKey("checkout", requestHeaders), 8, 10 * 60);
  if (!limiter.allowed) {
    return {
      status: "error",
      message: `Too many checkout attempts. Please try again in ${limiter.retryAfterSeconds} seconds.`,
    };
  }

  const raw = {
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode") || undefined,
    note: formData.get("note") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    couponCode: formData.get("couponCode") || undefined,
    idempotencyKey: formData.get("idempotencyKey"),
    items: parseItems(formData.get("items")),
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Checkout is not connected yet. This preview storefront needs Supabase environment variables and migrations before orders can be placed. No order was created.",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      status: "error",
      message: "The store could not reach its database. Please try again shortly.",
    };
  }

  const payload: Json = {
    customer: {
      name: parsed.data.customerName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
    },
    delivery: {
      address: parsed.data.address,
      city: parsed.data.city,
      postal_code: parsed.data.postalCode || null,
    },
    items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    payment_method: parsed.data.paymentMethod,
    coupon_code: parsed.data.couponCode || null,
    customer_note: parsed.data.note || null,
  };

  const { data, error } = await supabase.rpc("create_order", {
    p_payload: payload,
    p_idempotency_key: parsed.data.idempotencyKey,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message ||
        "We could not place your order. Please check your bag and try again.",
    };
  }

  const result = data as { order_number?: string; tracking_token?: string; error?: string } | null;
  if (!result?.order_number || !result.tracking_token) {
    return {
      status: "error",
      message: result?.error || "We could not confirm your order. Please try again.",
    };
  }

  redirect(
    `/order/success/${encodeURIComponent(result.order_number)}?token=${encodeURIComponent(result.tracking_token)}`,
  );
}
