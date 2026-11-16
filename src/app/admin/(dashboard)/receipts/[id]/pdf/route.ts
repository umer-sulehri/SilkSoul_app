import { getAdminContext } from "@/lib/auth/admin";
import {
  getAdminOrder,
  getAdminReceipt,
  getAdminStoreSettings,
} from "@/lib/data/admin";
import { renderPdf } from "@/lib/pdf/documents";
import { siteConfig } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getAdminContext();
  if (!context.isStaff) {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const receipt = await getAdminReceipt(id);
  if (!receipt) {
    return new Response("Receipt not found", { status: 404 });
  }

  const [order, settings] = await Promise.all([
    getAdminOrder(receipt.order_id),
    getAdminStoreSettings(),
  ]);

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const items = (order.order_items ?? []).map((item) => ({
    name: item.product_name,
    sku: item.product_sku,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.line_total),
  }));

  const pdf = await renderPdf({
    kind: "receipt",
    number: receipt.receipt_number,
    status: receipt.payment_status,
    issueDate: receipt.issued_at,
    orderNumber: order.order_number,
    paymentMethod: receipt.payment_method,
    paymentStatus: receipt.payment_status,
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email,
      address: order.delivery_address,
      city: order.city,
      postalCode: order.postal_code,
    },
    business: {
      name: settings?.store_name ?? "SilkSoul",
      email: settings?.support_email ?? "silksoul26@gmail.com",
      phone: settings?.support_phone ?? "+92 325 2545556",
      address: settings?.address ?? null,
      website: siteConfig.url.replace(/^https?:\/\//, ""),
    },
    items,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount_total),
    delivery: Number(order.delivery_fee),
    tax: Number(order.tax_total),
    total: Number(receipt.amount),
    currency: order.currency,
    notes: order.customer_note,
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${receipt.receipt_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
