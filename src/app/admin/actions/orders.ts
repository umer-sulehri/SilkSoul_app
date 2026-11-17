"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth/admin";
import { orderStatusPath } from "@/lib/order-status";
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

  const supabase = context.supabase;

  const parsed = orderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Choose a valid next status." };
  }

  const { orderId, status, note } = parsed.data;
  const { error: directError } = await supabase.rpc("admin_update_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_note: note ?? "",
  });

  if (directError) {
    if (!directError.message.includes("Cannot change order status from")) {
      return { status: "error", message: directError.message };
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return { status: "error", message: orderError?.message ?? "Order not found." };
    }

    if (order.status === "returned" && status === "shipped") {
      return {
        status: "error",
        message: "Apply migration 0009_order_reship.sql to re-ship returned orders.",
      };
    }

    const path = orderStatusPath(order.status, status);
    if (!path?.length) {
      return { status: "error", message: directError.message };
    }

    for (const [index, nextStatus] of path.entries()) {
      const { error } = await supabase.rpc("admin_update_order_status", {
        p_order_id: orderId,
        p_status: nextStatus,
        p_note: index === path.length - 1 ? (note ?? "") : "",
      });

      if (error) {
        return { status: "error", message: error.message };
      }
    }
  }

  revalidateOrder(orderId);
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

export async function confirmOrderPaymentAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to confirm payments." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return { status: "error", message: "Order not found." };

  const { data: order, error: orderError } = await context.supabase
    .from("orders")
    .select("payment_receipt_path, payment_method")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { status: "error", message: orderError?.message ?? "Order not found." };
  }

  if (!order.payment_receipt_path) {
    return { status: "error", message: "This order has no payment receipt to confirm." };
  }

  const confirmedAt = new Date().toISOString();
  const { error } = await context.supabase
    .from("orders")
    .update({
      payment_status: "paid",
      payment_confirmed_at: confirmedAt,
      payment_confirmed_by: context.user?.id ?? null,
    })
    .eq("id", orderId);

  if (error) return { status: "error", message: error.message };

  await context.supabase.from("audit_logs").insert({
    actor_user_id: context.user?.id ?? null,
    action: "order.payment_confirmed",
    entity_type: "order",
    entity_id: orderId,
    details: {
      payment_method: order.payment_method,
      payment_receipt_path: order.payment_receipt_path,
    },
  });

  revalidateOrder(orderId);
  return { status: "success", message: "Payment receipt confirmed and order marked paid." };
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
