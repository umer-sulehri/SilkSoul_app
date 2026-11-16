import { getAdminContext } from "@/lib/auth/admin";
import { getAdminQuotation, getAdminStoreSettings } from "@/lib/data/admin";
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
  const [quotation, settings] = await Promise.all([
    getAdminQuotation(id),
    getAdminStoreSettings(),
  ]);

  if (!quotation) {
    return new Response("Quotation not found", { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const items = (quotation.quotation_items ?? []).map((item) => ({
    name: item.product_name,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.line_total),
  }));

  const pdf = await renderPdf({
    kind: "quotation",
    number: quotation.quotation_number,
    status: quotation.status,
    issueDate: quotation.created_at,
    validUntil: quotation.validity_date,
    customer: {
      name: quotation.customer_name,
      phone: quotation.customer_phone,
      email: quotation.customer_email,
      address: quotation.customer_address,
      city: quotation.customer_city,
      postalCode: quotation.customer_postal_code,
    },
    business: {
      name: settings?.store_name ?? "SilkSoul",
      email: settings?.support_email ?? "silksoul26@gmail.com",
      phone: settings?.support_phone ?? "+92 325 2545556",
      address: settings?.address ?? null,
      website: siteConfig.url.replace(/^https?:\/\//, ""),
    },
    items,
    subtotal: Number(quotation.subtotal),
    discount: Number(quotation.discount_total),
    delivery: Number(quotation.delivery_fee),
    tax: Number(quotation.tax_total),
    total: Number(quotation.grand_total),
    currency: quotation.currency,
    notes: quotation.notes,
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${quotation.quotation_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
