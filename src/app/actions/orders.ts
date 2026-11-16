"use server";

import { headers } from "next/headers";
import type { PublicOrder } from "@/types/catalog";
import { trackOrder } from "@/lib/data/orders";
import { trackOrderSchema } from "@/lib/validations/schemas";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/utils";

export type TrackOrderState = {
  status: "idle" | "success" | "error";
  message?: string;
  order?: PublicOrder;
  fieldErrors?: Record<string, string>;
};

export async function trackOrderAction(
  _previousState: TrackOrderState,
  formData: FormData,
): Promise<TrackOrderState> {
  const requestHeaders = await headers();
  const limiter = rateLimit(getClientKey("track-order", requestHeaders), 10, 10 * 60);
  if (!limiter.allowed) {
    return {
      status: "error",
      message: `Too many lookup attempts. Please try again in ${limiter.retryAfterSeconds} seconds.`,
    };
  }

  const parsed = trackOrderSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the details." };
  }

  const result = await trackOrder(
    parsed.data.orderNumber.trim().toUpperCase(),
    normalizePhone(parsed.data.phone),
  );

  if (!result.order) {
    return { status: "error", message: result.message ?? "Order not found." };
  }

  return { status: "success", order: result.order };
}
