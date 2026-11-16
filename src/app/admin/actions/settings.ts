"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database";
import { getAdminContext } from "@/lib/auth/admin";
import { couponFormSchema, storeSettingsSchema } from "@/lib/validations/schemas";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export type CouponActionState = SettingsActionState;

export async function saveStoreSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) {
    return { status: "error", message: "Only administrators can change store settings." };
  }

  const parsed = storeSettingsSchema.safeParse({
    storeName: formData.get("storeName"),
    supportEmail: formData.get("supportEmail"),
    supportPhone: formData.get("supportPhone"),
    currency: formData.get("currency"),
    deliveryFee: formData.get("deliveryFee"),
    freeDeliveryThreshold: formData.get("freeDeliveryThreshold"),
    codEnabled: formData.get("codEnabled") === "on",
    announcement: formData.get("announcement") || undefined,
    address: formData.get("address") || undefined,
    instagram: formData.get("instagram") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please review the highlighted fields.", fieldErrors };
  }

  const { error } = await context.supabase
    .from("store_settings")
    .update({
      store_name: parsed.data.storeName,
      support_email: parsed.data.supportEmail,
      support_phone: parsed.data.supportPhone,
      currency: parsed.data.currency,
      delivery_fee: parsed.data.deliveryFee,
      free_delivery_threshold: parsed.data.freeDeliveryThreshold,
      cod_enabled: parsed.data.codEnabled,
      announcement: parsed.data.announcement || null,
      address: parsed.data.address || null,
      socials: {
        instagram: parsed.data.instagram || null,
      } as Json,
    })
    .eq("id", 1);

  if (error) return { status: "error", message: error.message };

  await context.supabase.from("audit_logs").insert({
    actor_user_id: context.user?.id ?? null,
    action: "settings.updated",
    entity_type: "store_settings",
    entity_id: null,
    details: { store_name: parsed.data.storeName },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Store settings saved." };
}

export async function createCouponAction(
  _previousState: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) {
    return { status: "error", message: "Only administrators can create discount codes." };
  }

  const parsed = couponFormSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue"),
    minSubtotal: formData.get("minSubtotal") || 0,
    maxDiscount: formData.get("maxDiscount") || "",
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
    usageLimit: formData.get("usageLimit") || "",
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please review the discount details.", fieldErrors };
  }

  const { error } = await context.supabase.from("coupons").insert({
    code: parsed.data.code,
    description: parsed.data.description || null,
    discount_type: parsed.data.discountType,
    discount_value: parsed.data.discountValue,
    min_subtotal: parsed.data.minSubtotal,
    max_discount:
      typeof parsed.data.maxDiscount === "number" ? parsed.data.maxDiscount : null,
    starts_at: parsed.data.startsAt ? new Date(parsed.data.startsAt).toISOString() : null,
    ends_at: parsed.data.endsAt ? new Date(parsed.data.endsAt).toISOString() : null,
    usage_limit:
      typeof parsed.data.usageLimit === "number" ? parsed.data.usageLimit : null,
    is_active: parsed.data.isActive,
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("coupons_code_key")
        ? "That discount code already exists."
        : error.message,
    };
  }

  revalidatePath("/admin/settings");
  return { status: "success", message: "Discount code created." };
}

export async function toggleCouponAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) return;

  const id = String(formData.get("couponId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;

  await context.supabase.from("coupons").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/settings");
}

export async function deleteCouponAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) return;

  const id = String(formData.get("couponId") ?? "");
  if (!id) return;

  await context.supabase.from("coupons").delete().eq("id", id);
  revalidatePath("/admin/settings");
}
