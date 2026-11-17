"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database";
import { getAdminContext, type AdminContext } from "@/lib/auth/admin";
import { productFormSchema } from "@/lib/validations/schemas";

export type ProductActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function parseLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecifications(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) return [];
      return [
        {
          label: line.slice(0, separator).trim(),
          value: line.slice(separator + 1).trim(),
        },
      ];
    });
}

function friendlyError(message: string) {
  if (message.includes("products_slug_key")) return "That slug is already in use.";
  if (message.includes("products_sku_key")) return "That SKU is already in use.";
  return message;
}

type ServerSupabase = NonNullable<AdminContext["supabase"]>;

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function validateProductImage(file: File) {
  if (!allowedImageTypes.includes(file.type)) {
    return "Use a JPG, PNG, WebP or AVIF image.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Images must be smaller than 5 MB.";
  }
  return null;
}

async function storeProductImage(
  supabase: ServerSupabase,
  productId: string,
  file: File,
): Promise<string | null> {
  const validationError = validateProductImage(file);
  if (validationError) return validationError;

  const { data: existing } = await supabase
    .from("product_images")
    .select("id, is_primary, sort_order")
    .eq("product_id", productId);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const path = `${productId}/${crypto.randomUUID()}-${safeName}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return uploadError.message;

  const hasPrimary = (existing ?? []).some((image) => image.is_primary);
  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    alt_text: safeName.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
    sort_order: (existing ?? []).length,
    is_primary: !hasPrimary,
  });

  if (insertError) {
    await supabase.storage.from("product-images").remove([path]);
    return insertError.message;
  }

  return null;
}

export async function saveProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to manage products." };
  }

  const idValue = formData.get("id");
  const parsed = productFormSchema.safeParse({
    id: typeof idValue === "string" && idValue ? idValue : undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId") || "",
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || "",
    stockOnHand: formData.get("stockOnHand") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 0,
    benefits: formData.get("benefits") || undefined,
    ingredients: formData.get("ingredients") || undefined,
    usageInstructions: formData.get("usageInstructions") || undefined,
    specifications: formData.get("specifications") || undefined,
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    companionProductId: formData.get("companionProductId") || "",
    themePrimary: formData.get("themePrimary") || "#3e5a44",
    themeAccent: formData.get("themeAccent") || "#c19a5b",
    themeSoft: formData.get("themeSoft") || "#e9efe1",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const imageValue = formData.get("image");
  const image = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

  if (image && !data.id) {
    const imageError = validateProductImage(image);
    if (imageError) {
      return {
        status: "error",
        message: imageError,
        fieldErrors: { image: imageError },
      };
    }
  }

  if (data.id && data.companionProductId === data.id) {
    return {
      status: "error",
      message: "A product cannot be paired with itself.",
      fieldErrors: { companionProductId: "Choose a different product." },
    };
  }

  const payload = {
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    category_id: data.categoryId || null,
    short_description: data.shortDescription || null,
    description: data.description || null,
    price: data.price,
    compare_at_price:
      typeof data.compareAtPrice === "number" ? data.compareAtPrice : null,
    benefits: parseLines(data.benefits ?? null) as Json,
    ingredients: parseLines(data.ingredients ?? null) as Json,
    usage_instructions: data.usageInstructions || null,
    specifications: parseSpecifications(data.specifications ?? null) as Json,
    low_stock_threshold: data.lowStockThreshold,
    is_active: data.isActive ?? false,
    is_featured: data.isFeatured ?? false,
    companion_product_id: data.companionProductId || null,
    theme_primary: data.themePrimary,
    theme_accent: data.themeAccent,
    theme_soft: data.themeSoft,
    seo_title: data.seoTitle || null,
    seo_description: data.seoDescription || null,
  };

  if (data.id) {
    const { error } = await context.supabase
      .from("products")
      .update(payload)
      .eq("id", data.id);

    if (error) {
      return { status: "error", message: friendlyError(error.message) };
    }
  } else {
    const { data: inserted, error } = await context.supabase
      .from("products")
      .insert({ ...payload, stock_on_hand: 0, stock_reserved: 0 })
      .select("id")
      .single();

    if (error || !inserted) {
      return {
        status: "error",
        message: error ? friendlyError(error.message) : "The product could not be created.",
      };
    }

    if (data.stockOnHand > 0) {
      const { error: stockError } = await context.supabase.rpc("adjust_inventory", {
        p_product_id: inserted.id,
        p_on_hand_delta: data.stockOnHand,
        p_movement_type: "restock",
        p_reason: "Opening stock",
        p_notes: "Initial stock entered when the product was created.",
      });

      if (stockError) {
        revalidatePath("/admin/products");
        return {
          status: "error",
          message: `Product created, but opening stock could not be added: ${stockError.message}`,
        };
      }
    }

    if (image) {
      const imageError = await storeProductImage(context.supabase, inserted.id, image);
      if (imageError) {
        revalidatePath("/admin/products");
        redirect(
          `/admin/products/${inserted.id}/edit?imageError=${encodeURIComponent(imageError)}`,
        );
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/");
  redirect("/admin/products?saved=1");
}

export async function archiveProductAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { data: product } = await context.supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await context.supabase
    .from("products")
    .update({ is_active: false, archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return;

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
  redirect("/admin/products?archived=1");
}

export type ImageActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function uploadProductImageAction(
  _previousState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to upload images." };
  }

  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("image");
  if (!productId || !(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose an image to upload." };
  }

  const imageError = await storeProductImage(context.supabase, productId, file);
  if (imageError) {
    return { status: "error", message: imageError };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { status: "success", message: "Image uploaded." };
}

export async function deleteProductImageAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) return;

  const imageId = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!imageId || !productId) return;

  const { data: image } = await context.supabase
    .from("product_images")
    .select("id, storage_path, is_primary, product_id")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) return;

  if (!image.storage_path.startsWith("/") && !image.storage_path.startsWith("http")) {
    await context.supabase.storage.from("product-images").remove([image.storage_path]);
  }

  await context.supabase.from("product_images").delete().eq("id", imageId);

  if (image.is_primary) {
    const { data: remaining } = await context.supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1);

    if (remaining?.[0]) {
      await context.supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", remaining[0].id);
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function setPrimaryImageAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) return;

  const imageId = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!imageId || !productId) return;

  await context.supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  await context.supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
