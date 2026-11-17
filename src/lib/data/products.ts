import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/env";
import { demoProducts, demoStoreSettings } from "@/lib/demo/catalog";
import { paymentSettingsFromSocials } from "@/lib/payments";
import { siteThemeFromSocials } from "@/lib/site-theme";
import { toArray, toSpecifications } from "@/lib/utils";
import type {
  CategorySummary,
  Product,
  ProductFilters,
  ProductQueryRow,
  StoreSettings,
} from "@/types/catalog";

const productSelect = `
  id,
  slug,
  name,
  sku,
  short_description,
  description,
  price,
  compare_at_price,
  currency,
  benefits,
  ingredients,
  usage_instructions,
  specifications,
  stock_on_hand,
  stock_reserved,
  low_stock_threshold,
  is_active,
  is_featured,
  seo_title,
  seo_description,
  archived_at,
  created_at,
  updated_at,
  category:categories(id, name, slug),
  product_images(id, storage_path, alt_text, sort_order, is_primary),
  reviews(id, display_name, rating, title, body, is_verified_purchase, status, created_at)
`;

function resolveImagePath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `${supabaseConfig.url}/storage/v1/object/public/product-images/${path}`;
}

export function mapProduct(row: ProductQueryRow): Product {
  const images = [...row.product_images]
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.sort_order - b.sort_order;
    })
    .map((image) => ({
      id: image.id,
      path: resolveImagePath(image.storage_path),
      alt: image.alt_text ?? row.name,
      sortOrder: image.sort_order,
      isPrimary: image.is_primary,
    }));

  const reviews = [...row.reviews]
    .filter((review) => review.status === "approved")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((review) => ({
      id: review.id,
      displayName: review.display_name,
      rating: review.rating,
      title: review.title,
      body: review.body,
      isVerifiedPurchase: review.is_verified_purchase,
      createdAt: review.created_at,
      status: review.status,
    }));

  const reviewCount = reviews.length;
  const average =
    reviewCount === 0
      ? 0
      : Math.round(
          (reviews.reduce((total, review) => total + review.rating, 0) / reviewCount) * 10,
        ) / 10;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    currency: row.currency,
    benefits: toArray(row.benefits),
    ingredients: toArray(row.ingredients),
    usageInstructions: row.usage_instructions ?? "",
    specifications: toSpecifications(row.specifications),
    stockOnHand: row.stock_on_hand,
    stockReserved: row.stock_reserved,
    lowStockThreshold: row.low_stock_threshold,
    availableStock: Math.max(0, row.stock_on_hand - row.stock_reserved),
    isActive: row.is_active,
    isFeatured: row.is_featured,
    companionProductId: row.companion_product_id ?? null,
    theme: {
      primary: row.theme_primary ?? "#3e5a44",
      accent: row.theme_accent ?? "#c19a5b",
      soft: row.theme_soft ?? "#e9efe1",
    },
    category: row.category,
    images:
      images.length > 0
        ? images
        : [
            {
              id: `${row.id}-placeholder`,
              path: "/images/product-1-hair-oil.jpeg",
              alt: row.name,
              sortOrder: 0,
              isPrimary: true,
            },
          ],
    rating: { average, count: reviewCount },
    reviews,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function filterAndSort(products: Product[], filters: ProductFilters = {}) {
  const search = filters.search?.trim().toLowerCase() ?? "";
  const category = filters.category?.trim() ?? "";
  const availability = filters.availability ?? "all";

  const filtered = products.filter((product) => {
    if (!product.isActive || product.archivedAt) return false;
    if (search) {
      const haystack = `${product.name} ${product.shortDescription} ${product.description}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (category && product.category?.slug !== category) return false;
    if (availability === "in-stock" && product.availableStock <= 0) return false;
    if (availability === "out-of-stock" && product.availableStock > 0) return false;
    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return filtered.sort((a, b) => a.price - b.price);
    case "price-desc":
      return filtered.sort((a, b) => b.price - a.price);
    case "name-asc":
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    default:
      return filtered.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }
}

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return filterAndSort(
      demoProducts.map((product) => ({ ...product })),
      filters,
    );
  }

  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .is("archived_at", null);

  const search = filters.search?.replace(/[,()%]/g, " ").trim();
  if (search) {
    query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`);
  }

  const { data, error } = await query.order("is_featured", { ascending: false });
  if (error || !data) return [];

  return filterAndSort((data as unknown as ProductQueryRow[]).map(mapProduct), filters);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return demoProducts.filter((product) => product.isFeatured).slice(0, limit);
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .eq("is_featured", true)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as ProductQueryRow[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) return null;
  const product = mapProduct(data as unknown as ProductQueryRow);
  const experience = await getProductExperience(product.id);

  return { ...product, ...experience };
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return demoProducts.filter((item) => item.id !== product.id).slice(0, limit);
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: relations } = await supabase
    .from("product_relations")
    .select("related_product_id, sort_order")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true })
    .limit(limit);

  const relatedIds = (relations ?? []).map((relation) => relation.related_product_id);

  if (relatedIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .in("id", relatedIds)
      .eq("is_active", true)
      .is("archived_at", null);

    if (!error && data) {
      const mapped = (data as unknown as ProductQueryRow[]).map(mapProduct);
      return relatedIds
        .map((id) => mapped.find((item) => item.id === id))
        .filter((item): item is Product => Boolean(item));
    }
  }

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .neq("id", product.id)
    .eq("is_active", true)
    .is("archived_at", null)
    .order("is_featured", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as ProductQueryRow[]).map(mapProduct);
}

type ProductExperience = Pick<Product, "companionProductId" | "theme">;

const defaultProductTheme = {
  primary: "#3e5a44",
  accent: "#c19a5b",
  soft: "#e9efe1",
};

async function getProductExperience(productId: string): Promise<ProductExperience> {
  const supabase = await createClient();
  if (!supabase) {
    return { companionProductId: null, theme: defaultProductTheme };
  }

  const { data, error } = await supabase
    .from("products")
    .select("companion_product_id, theme_primary, theme_accent, theme_soft")
    .eq("id", productId)
    .maybeSingle();

  if (error || !data) {
    return { companionProductId: null, theme: defaultProductTheme };
  }

  const row = data as {
    companion_product_id: string | null;
    theme_primary: string;
    theme_accent: string;
    theme_soft: string;
  };

  return {
    companionProductId: row.companion_product_id,
    theme: {
      primary: row.theme_primary,
      accent: row.theme_accent,
      soft: row.theme_soft,
    },
  };
}

export async function getCompanionProduct(product: Product): Promise<Product | null> {
  if (!product.companionProductId) return null;

  if (!isSupabaseConfigured()) {
    return demoProducts.find((item) => item.id === product.companionProductId) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", product.companionProductId)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapProduct(data as unknown as ProductQueryRow);
}

export async function getCategories(): Promise<CategorySummary[]> {
  if (!isSupabaseConfigured()) {
    const seen = new Map<string, CategorySummary>();
    demoProducts.forEach((product) => {
      if (product.category) seen.set(product.category.slug, product.category);
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data;
}

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured()) return demoStoreSettings;

  const supabase = await createClient();
  if (!supabase) return demoStoreSettings;

  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "store_name, support_email, support_phone, currency, delivery_fee, free_delivery_threshold, cod_enabled, announcement, socials",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return demoStoreSettings;

  return {
    storeName: data.store_name,
    supportEmail: data.support_email,
    supportPhone: data.support_phone,
    currency: data.currency,
    deliveryFee: Number(data.delivery_fee),
    freeDeliveryThreshold: Number(data.free_delivery_threshold),
    codEnabled: data.cod_enabled,
    payments: paymentSettingsFromSocials(data.socials),
    announcement: data.announcement,
    theme: siteThemeFromSocials(data.socials),
  };
});
