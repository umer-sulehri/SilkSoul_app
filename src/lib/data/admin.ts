import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminNotificationRow,
  CouponRow,
  InventoryMovementRow,
  OrderItemRow,
  OrderRow,
  OrderStatusHistoryRow,
  ProductImageRow,
  ProductRow,
  ProfileRow,
  QuotationItemRow,
  QuotationRow,
  ReceiptRow,
  ReviewRow,
  StoreSettingsRow,
  UserRoleRow,
} from "@/types/database";

export type AdminProduct = ProductRow & {
  category: { name: string } | null;
  product_images?: Pick<ProductImageRow, "id" | "storage_path" | "alt_text" | "sort_order" | "is_primary">[];
};

export type AdminOrder = OrderRow & {
  order_items?: OrderItemRow[];
  order_status_history?: OrderStatusHistoryRow[];
  receipts?: ReceiptRow[];
  paymentReceiptUrl?: string | null;
};

export type AdminOrderListItem = OrderRow & {
  order_items?: { count: number }[];
};

export type AdminQuotation = QuotationRow & {
  quotation_items?: QuotationItemRow[];
  converted_order?: { id: string; order_number: string } | null;
};

export type AdminQuotationListItem = QuotationRow & {
  quotation_items?: { count: number }[];
};

export type AdminReceipt = ReceiptRow & {
  order: { id: string; order_number: string; customer_name: string } | null;
};

export type AdminReview = ReviewRow & {
  product: { name: string; slug: string } | null;
};

export type TeamMember = {
  profile: ProfileRow;
  roles: string[];
};

function cleanSearch(value: string | undefined) {
  return value?.replace(/[,()%]/g, " ").trim() ?? "";
}

export async function getAdminClient() {
  return createClient();
}

export async function getDashboardData() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    ordersResult,
    orderCountResult,
    pendingResult,
    deliveredResult,
    productsResult,
    productCountResult,
    reviewCountResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from("orders").select("*").order("placed_at", { ascending: false }).limit(8),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed", "processing"]),
    supabase
      .from("orders")
      .select("grand_total")
      .eq("status", "delivered")
      .returns<{ grand_total: number }[]>(),
    supabase.from("products").select("*").eq("is_active", true).is("archived_at", null),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("admin_notifications")
      .select("*")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const products = (productsResult.data ?? []) as ProductRow[];
  const lowStock = products.filter(
    (product) =>
      product.stock_on_hand - product.stock_reserved <= product.low_stock_threshold,
  );

  const revenue = (deliveredResult.data ?? []).reduce(
    (total, order) => total + Number(order.grand_total),
    0,
  );

  return {
    recentOrders: (ordersResult.data ?? []) as OrderRow[],
    orderCount: orderCountResult.count ?? 0,
    activeOrders: pendingResult.count ?? 0,
    revenue,
    productCount: productCountResult.count ?? 0,
    pendingReviews: reviewCountResult.count ?? 0,
    lowStock: lowStock.sort(
      (a, b) =>
        a.stock_on_hand - a.stock_reserved - (b.stock_on_hand - b.stock_reserved),
    ),
    notifications: (notificationsResult.data ?? []) as AdminNotificationRow[],
  };
}

export async function listAdminProducts(search?: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("*, category:categories(name), product_images(id, storage_path, is_primary, sort_order)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as unknown as AdminProduct[];
  const term = cleanSearch(search).toLowerCase();
  if (!term) return products;

  return products.filter((product) =>
    `${product.name} ${product.sku} ${product.slug} ${product.category?.name ?? ""}`
      .toLowerCase()
      .includes(term),
  );
}

export async function getAdminProduct(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("products")
    .select("*, category:categories(name), product_images(id, storage_path, alt_text, sort_order, is_primary)")
    .eq("id", id)
    .maybeSingle();

  return (data as unknown as AdminProduct | null) ?? null;
}

export type AdminProductOption = {
  id: string;
  name: string;
  sku: string;
  is_active: boolean;
};

export async function listAdminProductOptions(): Promise<AdminProductOption[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("id, name, sku, is_active")
    .is("archived_at", null)
    .order("name", { ascending: true });

  return (data ?? []) as AdminProductOption[];
}

export async function listAdminCategories() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function listInventory(search?: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .is("archived_at", null)
    .order("stock_on_hand", { ascending: true });

  const products = (data ?? []) as unknown as AdminProduct[];
  const term = cleanSearch(search).toLowerCase();
  if (!term) return products;
  return products.filter((product) =>
    `${product.name} ${product.sku}`.toLowerCase().includes(term),
  );
}

export async function getInventoryDetail(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const [productResult, movementsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(name)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("inventory_movements")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const product = productResult.data as unknown as AdminProduct | null;
  if (!product) return null;

  return {
    product,
    movements: (movementsResult.data ?? []) as InventoryMovementRow[],
  };
}

export async function listAdminOrders({
  status,
  search,
}: {
  status?: string;
  search?: string;
} = {}) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("orders")
    .select("*, order_items(count)")
    .order("placed_at", { ascending: false });

  if (
    status &&
    ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"].includes(
      status,
    )
  ) {
    query = query.eq("status", status as OrderRow["status"]);
  }

  const term = cleanSearch(search);
  if (term) {
    query = query.or(
      `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`,
    );
  }

  const { data } = await query;
  return (data ?? []) as unknown as AdminOrderListItem[];
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const [orderResult, itemsResult, historyResult, receiptsResult] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("receipts")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const order = orderResult.data as OrderRow | null;
  if (!order) return null;

  let paymentReceiptUrl: string | null = null;
  if (order.payment_receipt_path) {
    const admin = createAdminClient();
    if (admin) {
      const { data } = await admin.storage
        .from("payment-receipts")
        .createSignedUrl(order.payment_receipt_path, 60 * 10);
      paymentReceiptUrl = data?.signedUrl ?? null;
    }
  }

  return {
    ...order,
    order_items: (itemsResult.data ?? []) as OrderItemRow[],
    order_status_history: (historyResult.data ?? []) as OrderStatusHistoryRow[],
    receipts: (receiptsResult.data ?? []) as ReceiptRow[],
    paymentReceiptUrl,
  };
}

export async function listAdminQuotations({
  status,
  search,
}: {
  status?: string;
  search?: string;
} = {}): Promise<AdminQuotationListItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("quotations")
    .select("*, quotation_items(count)")
    .order("created_at", { ascending: false });

  if (status && ["draft", "sent", "accepted", "rejected", "expired"].includes(status)) {
    query = query.eq("status", status as QuotationRow["status"]);
  }

  const term = cleanSearch(search);
  if (term) {
    query = query.or(
      `quotation_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`,
    );
  }

  const { data } = await query;
  return (data ?? []) as unknown as AdminQuotationListItem[];
}

export async function getAdminQuotation(id: string): Promise<AdminQuotation | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const [quotationResult, itemsResult] = await Promise.all([
    supabase.from("quotations").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const quotation = quotationResult.data as QuotationRow | null;
  if (!quotation) return null;

  let convertedOrder: AdminQuotation["converted_order"] = null;
  if (quotation.converted_order_id) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("id", quotation.converted_order_id)
      .maybeSingle();
    convertedOrder = data ?? null;
  }

  return {
    ...quotation,
    quotation_items: (itemsResult.data ?? []) as QuotationItemRow[],
    converted_order: convertedOrder,
  };
}

export async function listAdminReceipts(): Promise<AdminReceipt[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("receipts")
    .select("*, order:orders(id, order_number, customer_name)")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as AdminReceipt[];
}

export async function getAdminReceipt(id: string): Promise<AdminReceipt | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("receipts")
    .select("*, order:orders(id, order_number, customer_name)")
    .eq("id", id)
    .maybeSingle();

  return (data as unknown as AdminReceipt | null) ?? null;
}

export async function listAdminReviews(status?: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("reviews")
    .select("*, product:products(name, slug)")
    .order("created_at", { ascending: false });

  if (status && ["pending", "approved", "rejected", "hidden"].includes(status)) {
    query = query.eq("status", status as ReviewRow["status"]);
  }

  const { data } = await query;
  return (data ?? []) as unknown as AdminReview[];
}

export async function getAdminStoreSettings(): Promise<StoreSettingsRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  return (data as StoreSettingsRow | null) ?? null;
}

export async function listCoupons(): Promise<CouponRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as CouponRow[];
}

export async function listTeam(): Promise<TeamMember[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const [profilesResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("*"),
  ]);

  const roles = (rolesResult.data ?? []) as UserRoleRow[];
  return ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => ({
    profile,
    roles: roles.filter((role) => role.user_id === profile.id).map((role) => role.role),
  }));
}
