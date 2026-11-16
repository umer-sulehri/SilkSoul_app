"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth/admin";
import { orderStatusSchema } from "@/lib/validations/schemas";

export type OrderActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const paymentStatuses = [
  "unpaid",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
] as const;

function revalidateOrder(id: string) {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/track-order");
}

export async function updateOrderStatusAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to update orders." };
  }

  const parsed = orderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Choose a valid next status." };
  }

  const { error } = await context.supabase.rpc("admin_update_order_status", {
    p_order_id: parsed.data.orderId,
    p_status: parsed.data.status,
    p_note: parsed.data.note ?? "",
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidateOrder(parsed.data.orderId);
  return {
    status: "success",
    message: `Order marked ${parsed.data.status}. Inventory has been updated where required.`,
  };
}

export async function updatePaymentStatusAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to update payments." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");

  if (!orderId || !paymentStatuses.includes(paymentStatus as (typeof paymentStatuses)[number])) {
    return { status: "error", message: "Choose a valid payment status." };
  }

  const { error } = await context.supabase
    .from("orders")
    .update({ payment_status: paymentStatus as (typeof paymentStatuses)[number] })
    .eq("id", orderId);

  if (error) return { status: "error", message: error.message };

  await context.supabase.from("audit_logs").insert({
    actor_user_id: context.user?.id ?? null,
    action: "order.payment_status_changed",
    entity_type: "order",
    entity_id: orderId,
    details: { payment_status: paymentStatus },
  });

  revalidateOrder(orderId);
  return { status: "success", message: "Payment status updated." };
}

export async function saveOrderNoteAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to update orders." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const note = String(formData.get("adminNote") ?? "").trim().slice(0, 2000);

  if (!orderId) return { status: "error", message: "Order not found." };

  const { error } = await context.supabase
    .from("orders")
    .update({ admin_note: note || null })
    .eq("id", orderId);

  if (error) return { status: "error", message: error.message };

  revalidateOrder(orderId);
  return { status: "success", message: "Internal note saved." };
}

export async function markNotificationReadAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) return;

  const id = String(formData.get("notificationId") ?? "");
  if (!id) return;

  await context.supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin");
}
