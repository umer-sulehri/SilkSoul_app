export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type UserRole = "admin" | "staff" | "customer";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed";
export type PaymentMethod = "cod" | "bank_transfer" | "card";
export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden";
export type MovementType =
  | "restock"
  | "manual_adjustment"
  | "order_reserved"
  | "order_released"
  | "order_fulfilled"
  | "damaged"
  | "returned";
export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRoleRow = {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  benefits: Json;
  ingredients: Json;
  usage_instructions: string | null;
  specifications: Json;
  stock_on_hand: number;
  stock_reserved: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  companion_product_id: string | null;
  theme_primary: string;
  theme_accent: string;
  theme_soft: string;
  seo_title: string | null;
  seo_description: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductRelationRow = {
  product_id: string;
  related_product_id: string;
  sort_order: number;
  created_at: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  tracking_token: string;
  idempotency_key: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  city: string;
  postal_code: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  tax_total: number;
  grand_total: number;
  currency: string;
  coupon_code: string | null;
  customer_note: string | null;
  admin_note: string | null;
  placed_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
};

export type OrderStatusHistoryRow = {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  actor_user_id: string | null;
  note: string | null;
  created_at: string;
};

export type InventoryMovementRow = {
  id: string;
  product_id: string;
  on_hand_delta: number;
  reserved_delta: number;
  quantity_delta: number;
  movement_type: MovementType;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  actor_user_id: string | null;
  notes: string | null;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  product_id: string;
  customer_id: string | null;
  order_item_id: string | null;
  display_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_subtotal: number;
  max_discount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  per_customer_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponUsageRow = {
  id: string;
  coupon_id: string;
  order_id: string;
  customer_id: string | null;
  discount_amount: number;
  created_at: string;
};

export type StoreSettingsRow = {
  id: number;
  store_name: string;
  support_email: string;
  support_phone: string;
  currency: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  cod_enabled: boolean;
  address: string | null;
  socials: Json;
  announcement: string | null;
  updated_at: string;
};

export type ShippingRuleRow = {
  id: string;
  name: string;
  city: string | null;
  fee: number;
  free_threshold: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuotationRow = {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string | null;
  customer_city: string | null;
  customer_postal_code: string | null;
  status: QuotationStatus;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  tax_total: number;
  grand_total: number;
  currency: string;
  notes: string | null;
  validity_date: string | null;
  converted_order_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type QuotationItemRow = {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
};

export type ReceiptRow = {
  id: string;
  receipt_number: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  issued_at: string;
  storage_path: string | null;
  generated_by: string | null;
  metadata: Json;
  created_at: string;
};

export type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Json;
  created_at: string;
};

export type AdminNotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type UploadRow = {
  id: string;
  bucket_id: string;
  name: string;
  owner: string | null;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  metadata: Json | null;
  path_tokens: string[] | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      user_roles: Table<UserRoleRow>;
      categories: Table<CategoryRow>;
      brands: Table<BrandRow>;
      products: Table<ProductRow>;
      product_images: Table<ProductImageRow>;
      product_relations: Table<ProductRelationRow>;
      orders: Table<OrderRow>;
      order_items: Table<OrderItemRow>;
      order_status_history: Table<OrderStatusHistoryRow>;
      inventory_movements: Table<InventoryMovementRow>;
      reviews: Table<ReviewRow>;
      coupons: Table<CouponRow>;
      coupon_usage: Table<CouponUsageRow>;
      store_settings: Table<StoreSettingsRow>;
      shipping_rules: Table<ShippingRuleRow>;
      quotations: Table<QuotationRow>;
      quotation_items: Table<QuotationItemRow>;
      receipts: Table<ReceiptRow>;
      audit_logs: Table<AuditLogRow>;
      admin_notifications: Table<AdminNotificationRow>;
    };
    Views: {
      product_ratings: {
        Row: {
          product_id: string;
          review_count: number;
          average_rating: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff_or_admin: { Args: Record<string, never>; Returns: boolean };
      create_order: {
        Args: { p_payload: Json; p_idempotency_key: string };
        Returns: Json;
      };
      track_order: {
        Args: { p_order_number: string; p_phone: string };
        Returns: Json;
      };
      get_order_by_token: {
        Args: { p_order_number: string; p_token: string };
        Returns: Json;
      };
      submit_review: {
        Args: {
          p_product_id: string;
          p_display_name: string;
          p_rating: number;
          p_title: string;
          p_body: string;
        };
        Returns: Json;
      };
      admin_update_order_status: {
        Args: { p_order_id: string; p_status: string; p_note: string };
        Returns: Json;
      };
      adjust_inventory: {
        Args: {
          p_product_id: string;
          p_on_hand_delta: number;
          p_movement_type: string;
          p_reason: string;
          p_notes: string;
        };
        Returns: Json;
      };
      admin_set_user_role: {
        Args: { p_user_id: string; p_role: string };
        Returns: Json;
      };
      create_quotation: {
        Args: { p_payload: Json };
        Returns: Json;
      };
      set_quotation_status: {
        Args: { p_quotation_id: string; p_status: string };
        Returns: Json;
      };
      convert_quotation_to_order: {
        Args: { p_quotation_id: string; p_idempotency_key: string };
        Returns: Json;
      };
      create_receipt: {
        Args: { p_order_id: string };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      review_status: ReviewStatus;
      movement_type: MovementType;
      quotation_status: QuotationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
