"use server";

import { headers } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations/schemas";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

export type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitReviewAction(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const requestHeaders = await headers();
  const limiter = rateLimit(getClientKey("review", requestHeaders), 5, 30 * 60);
  if (!limiter.allowed) {
    return {
      status: "error",
      message: `Too many review attempts. Please try again in ${limiter.retryAfterSeconds} seconds.`,
    };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    displayName: formData.get("displayName"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });

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
        "Review submission is not connected yet. No review was saved. Connect Supabase to enable moderated reviews.",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "error", message: "The store database is not reachable right now." };
  }

  const { error } = await supabase.rpc("submit_review", {
    p_product_id: parsed.data.productId,
    p_display_name: parsed.data.displayName,
    p_rating: parsed.data.rating,
    p_title: parsed.data.title ?? "",
    p_body: parsed.data.body,
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "We could not save your review. Please try again.",
    };
  }

  return { status: "success" };
}
