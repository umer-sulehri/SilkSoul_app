"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Star, Trash2 } from "lucide-react";
import {
  deleteProductImageAction,
  setPrimaryImageAction,
  uploadProductImageAction,
  type ImageActionState,
} from "@/app/admin/actions/products";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { productImageUrl } from "@/lib/images";

const initialState: ImageActionState = { status: "idle" };

type ImageRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: ImageRow[];
}) {
  const [state, formAction, isPending] = useActionState(
    uploadProductImageAction,
    initialState,
  );

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  return (
    <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl text-ink">Product images</h2>
        <p className="mt-1 text-sm text-muted">
          The primary image appears on product cards. Files are stored in Supabase Storage.
        </p>
      </div>

      {state.message ? (
        <div
          className={
            state.status === "error"
              ? "mb-4 rounded-[10px] border border-danger/25 bg-danger/5 px-3 py-2 text-sm"
              : "mb-4 rounded-[10px] border border-success/25 bg-success/5 px-3 py-2 text-sm"
          }
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No images yet. Upload one below.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-[12px] border border-border bg-background"
            >
              <div className="relative aspect-square">
                <Image
                  src={productImageUrl(image.storage_path)}
                  alt={image.alt_text ?? "Product image"}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
                {image.is_primary ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    Primary
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-border px-2 py-2">
                {!image.is_primary ? (
                  <form action={setPrimaryImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="productId" value={productId} />
                    <button
                      type="submit"
                      className="rounded px-1.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                    >
                      Make primary
                    </button>
                  </form>
                ) : (
                  <span className="px-1.5 text-[11px] text-muted">Primary image</span>
                )}
                <form action={deleteProductImageAction}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <input type="hidden" name="productId" value={productId} />
                  <button
                    type="submit"
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="mt-5 border-t border-border pt-5">
        <input type="hidden" name="productId" value={productId} />
        <ImageUploadField
          key={sorted.length}
          label="Upload product image"
          required
        />
        <Button type="submit" variant="outline" loading={isPending} className="mt-3">
          Upload image
        </Button>
      </form>
    </section>
  );
}
