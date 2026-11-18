"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database";
import { getAdminContext, type AdminContext } from "@/lib/auth/admin";
import { productMediaType } from "@/lib/images";
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

const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const maxProductImages = 5;
const maxProductVideos = 1;

function validateProductVideo(file: File) {
  if (!allowedVideoTypes.includes(file.type)) {
    return "Use an MP4, WebM or MOV video.";
  }
  if (file.size > 25 * 1024 * 1024) {
    return "Videos must be smaller than 25 MB.";
  }
  return null;
}

async function uploadMediaFile(
  supabase: ServerSupabase,
  productId: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const path = `${productId}/${crypto.randomUUID()}-${safeName}`;
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };
  return { path };
}

export async function uploadProductMediaAction(
  _previousState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to upload media." };
  }

  const productId = String(formData.get("productId") ?? "");
  const imageFiles = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const videoEntry = formData.get("video");
  const videoFile =
    videoEntry instanceof File && videoEntry.size > 0 ? videoEntry : null;

  if (!productId) {
    return { status: "error", message: "Missing product." };
  }
  if (imageFiles.length === 0 && !videoFile) {
    return { status: "error", message: "Choose at least one image or a video to upload." };
  }

  for (const file of imageFiles) {
    const validationError = validateProductImage(file);
    if (validationError) return { status: "error", message: validationError };
  }
  if (videoFile) {
    const validationError = validateProductVideo(videoFile);
    if (validationError) return { status: "error", message: validationError };
  }

  const [{ data: existing, error: existingError }, { data: product }] = await Promise.all([
    context.supabase
      .from("product_images")
      .select("id, storage_path, is_primary, sort_order")
      .eq("product_id", productId),
    context.supabase.from("products").select("slug").eq("id", productId).maybeSingle(),
  ]);

  if (existingError) {
    return { status: "error", message: existingError.message };
  }

  const existingRows = existing ?? [];
  const existingImages = existingRows.filter(
    (row) => productMediaType(row.storage_path) === "image",
  );
  const existingVideos = existingRows.filter(
    (row) => productMediaType(row.storage_path) === "video",
  );

  if (existingImages.length + imageFiles.length > maxProductImages) {
    return {
      status: "error",
      message: `You can have up to ${maxProductImages} images per product. This product already has ${existingImages.length}.`,
    };
  }
  if (videoFile && existingVideos.length >= maxProductVideos) {
    return {
      status: "error",
      message: "This product already has a video. Delete the current video before adding another.",
    };
  }

  const uploadedPaths: string[] = [];
  const insertedIds: string[] = [];
  const highestOrder = existingRows.reduce(
    (highest, row) => Math.max(highest, row.sort_order),
    -1,
  );
  let nextOrder = highestOrder + 1;
  let hasPrimary = existingImages.some((row) => row.is_primary);

  async function insertMedia(
    file: File,
    mediaType: "image" | "video",
    sortOrder: number,
  ): Promise<string | null> {
    const uploaded = await uploadMediaFile(context.supabase!, productId, file);
    if (uploaded.error || !uploaded.path) {
      return uploaded.error ?? "The file could not be uploaded.";
    }
    uploadedPaths.push(uploaded.path);

    const { data: inserted, error } = await context.supabase!.from("product_images")
      .insert({
        product_id: productId,
        storage_path: uploaded.path,
        alt_text: file.name.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
        sort_order: sortOrder,
        is_primary: mediaType === "image" && !hasPrimary,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      return error?.message ?? "The media could not be saved.";
    }

    if (mediaType === "image") hasPrimary = true;
    insertedIds.push(inserted.id);
    return null;
  }

  for (const file of imageFiles) {
    const errorMessage = await insertMedia(file, "image", nextOrder);
    if (errorMessage) {
      if (uploadedPaths.length > 0) {
        await context.supabase.storage.from("product-images").remove(uploadedPaths);
      }
      if (insertedIds.length > 0) {
        await context.supabase.from("product_images").delete().in("id", insertedIds);
      }
      return { status: "error", message: errorMessage };
    }
    nextOrder += 1;
  }

  if (videoFile) {
    const errorMessage = await insertMedia(videoFile, "video", nextOrder);
    if (errorMessage) {
      if (uploadedPaths.length > 0) {
        await context.supabase.storage.from("product-images").remove(uploadedPaths);
      }
      if (insertedIds.length > 0) {
        await context.supabase.from("product_images").delete().in("id", insertedIds);
      }
      return { status: "error", message: errorMessage };
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);

  const parts = [
    imageFiles.length > 0
      ? `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"}`
      : null,
    videoFile ? "1 video" : null,
  ].filter(Boolean);

  return { status: "success", message: `${parts.join(" and ")} uploaded.` };
}

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
      .select("id, storage_path")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    const nextPrimary = (remaining ?? []).find(
      (row) => productMediaType(row.storage_path) === "image",
    );

    if (nextPrimary) {
      await context.supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", nextPrimary.id);
    }
  }

  const { data: product } = await context.supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
}

export async function setPrimaryImageAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) return;

  const imageId = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!imageId || !productId) return;

  const { data: image } = await context.supabase
    .from("product_images")
    .select("id, storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (!image || productMediaType(image.storage_path) === "video") return;

  await context.supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  await context.supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);

  const { data: product } = await context.supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
}
