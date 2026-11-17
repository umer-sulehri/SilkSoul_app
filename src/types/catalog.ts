import type { OrderStatus, PaymentMethod, PaymentStatus, ReviewStatus } from "@/types/database";

export type Money = number;

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  path: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type ProductRating = {
  average: number;
  count: number;
};

export type ProductTheme = {
  primary: string;
  accent: string;
  soft: string;
};

export type ProductReview = {
  id: string;
  displayName: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  status?: ReviewStatus;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  benefits: string[];
  ingredients: string[];
  usageInstructions: string;
  specifications: { label: string; value: string }[];
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold: number;
  availableStock: number;
  isActive: boolean;
  isFeatured: boolean;
  companionProductId: string | null;
  theme: ProductTheme;
  category: CategorySummary | null;
  images: ProductImage[];
  rating: ProductRating;
  reviews: ProductReview[];
  seoTitle: string | null;
  seoDescription: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  availability?: "all" | "in-stock" | "out-of-stock";
  sort?: "featured" | "price-asc" | "price-desc" | "name-asc" | "newest";
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  availableStock: number;
};

export type OrderSummaryItem = {
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PublicOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerName: string;
  city: string;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  currency: string;
  placedAt: string;
  items: OrderSummaryItem[];
  timeline: { status: OrderStatus; at: string | null }[];
};

export type ProductQueryRow = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  benefits: unknown;
  ingredients: unknown;
  usage_instructions: string | null;
  specifications: unknown;
  stock_on_hand: number;
  stock_reserved: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  companion_product_id?: string | null;
  theme_primary?: string;
  theme_accent?: string;
  theme_soft?: string;
  seo_title: string | null;
  seo_description: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  category: { id: string; name: string; slug: string } | null;
  product_images: {
    id: string;
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
  reviews: {
    id: string;
    display_name: string;
    rating: number;
    title: string | null;
    body: string;
    is_verified_purchase: boolean;
    status: ReviewStatus;
    created_at: string;
  }[];
};

export type SiteTheme = {
  background: string;
  surface: string;
  surfaceSoft: string;
  ink: string;
  muted: string;
  primary: string;
  accent: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
};

export type PaymentMethodDetails = {
  enabled: boolean;
  details: string;
};

export type PaymentSettings = {
  advance: PaymentMethodDetails;
  jazzcash: PaymentMethodDetails;
};

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  payments: PaymentSettings;
  announcement: string | null;
  theme: SiteTheme;
};
