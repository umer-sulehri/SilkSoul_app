"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth/admin";

const reviewStatuses = ["pending", "approved", "rejected", "hidden"] as const;

export async function moderateReviewAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) return;

  const reviewId = String(formData.get("reviewId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!reviewId || !reviewStatuses.includes(status as (typeof reviewStatuses)[number])) return;

  const { error } = await context.supabase
    .from("reviews")
    .update({ status: status as (typeof reviewStatuses)[number] })
    .eq("id", reviewId);

  if (error) return;

  await context.supabase.from("audit_logs").insert({
    actor_user_id: context.user?.id ?? null,
    action: `review.${status}`,
    entity_type: "review",
    entity_id: reviewId,
    details: { status },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath("/products");
}

export async function deleteReviewAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) return;

  const reviewId = String(formData.get("reviewId") ?? "");
  if (!reviewId) return;

  await context.supabase.from("reviews").delete().eq("id", reviewId);
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath("/products");
}
