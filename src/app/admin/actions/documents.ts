"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/admin";
import { quotationFormSchema } from "@/lib/validations/schemas";

export type DocumentActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const quotationStatuses = ["draft", "sent", "accepted", "rejected", "expired"] as const;

export async function createQuotationAction(
  _previousState: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to create quotations." };
  }

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { status: "error", message: "The quotation items could not be read. Please try again." };
  }

  const parsed = quotationFormSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail") || undefined,
    customerPhone: formData.get("customerPhone"),
    customerAddress: formData.get("customerAddress") || undefined,
    customerCity: formData.get("customerCity") || undefined,
    customerPostalCode: formData.get("customerPostalCode") || undefined,
    validityDate: formData.get("validityDate") || "",
    notes: formData.get("notes") || undefined,
    discountTotal: formData.get("discountTotal") || 0,
    deliveryFee: formData.get("deliveryFee") || 0,
    taxTotal: formData.get("taxTotal") || 0,
    items,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the quotation details.",
    };
  }

  const payload = {
    customer_name: parsed.data.customerName,
    customer_email: parsed.data.customerEmail || null,
    customer_phone: parsed.data.customerPhone,
    customer_address: parsed.data.customerAddress || null,
    customer_city: parsed.data.customerCity || null,
    customer_postal_code: parsed.data.customerPostalCode || null,
    validity_date: parsed.data.validityDate || null,
    notes: parsed.data.notes || null,
    discount_total: parsed.data.discountTotal,
    delivery_fee: parsed.data.deliveryFee,
    tax_total: parsed.data.taxTotal,
    items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  };

  const { data, error } = await context.supabase.rpc("create_quotation", {
    p_payload: payload,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  const quotationId = (data as { quotation_id?: string } | null)?.quotation_id;
  if (!quotationId) {
    return { status: "error", message: "The quotation was created but could not be opened." };
  }

  revalidatePath("/admin/quotations");
  redirect(`/admin/quotations/${quotationId}`);
}

export async function updateQuotationStatusAction(
  _previousState: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to update quotations." };
  }

  const quotationId = String(formData.get("quotationId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!quotationId || !quotationStatuses.includes(status as (typeof quotationStatuses)[number])) {
    return { status: "error", message: "Choose a valid quotation status." };
  }

  const { error } = await context.supabase.rpc("set_quotation_status", {
    p_quotation_id: quotationId,
    p_status: status,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/quotations");
  return { status: "success", message: `Quotation marked ${status}.` };
}

export async function convertQuotationAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    redirect("/admin/quotations?error=permission");
  }

  const quotationId = String(formData.get("quotationId") ?? "");
  if (!quotationId) redirect("/admin/quotations?error=missing");

  const { data, error } = await context.supabase.rpc("convert_quotation_to_order", {
    p_quotation_id: quotationId,
    p_idempotency_key: crypto.randomUUID(),
  });

  if (error) {
    redirect(
      `/admin/quotations/${quotationId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  const orderId = (data as { order_id?: string } | null)?.order_id;
  if (!orderId) redirect(`/admin/quotations/${quotationId}?error=conversion`);

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath(`/admin/quotations/${quotationId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function generateReceiptAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    redirect("/admin/orders?error=permission");
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) redirect("/admin/orders?error=missing");

  const { data, error } = await context.supabase.rpc("create_receipt", {
    p_order_id: orderId,
  });

  if (error) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(error.message)}`);
  }

  const receiptId = (data as { receipt_id?: string } | null)?.receipt_id;
  if (!receiptId) redirect(`/admin/orders/${orderId}?error=receipt`);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/receipts");
  redirect(`/admin/receipts/${receiptId}`);
}
