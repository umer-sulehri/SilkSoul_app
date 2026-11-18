"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { Film, ImagePlus, Play, Star, Trash2, Video, X } from "lucide-react";
import {
  deleteProductImageAction,
  setPrimaryImageAction,
  uploadProductMediaAction,
  type ImageActionState,
} from "@/app/admin/actions/products";
import { Button } from "@/components/ui/button";
import { productImageUrl, productMediaType } from "@/lib/images";

const initialState: ImageActionState = { status: "idle" };

const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;

type ImageRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

type SelectedFile = {
  file: File;
  url: string;
};

export function ProductImages({
  productId,
  images,
}: {
  productId: string;
  images: ImageRow[];
}) {
  const [state, formAction, isPending] = useActionState(
    uploadProductMediaAction,
    initialState,
  );
  const [selectedImages, setSelectedImages] = useState<SelectedFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SelectedFile | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  const imageCount = images.filter(
    (image) => productMediaType(image.storage_path) === "image",
  ).length;
  const hasVideo = images.some(
    (image) => productMediaType(image.storage_path) === "video",
  );
  const remainingImages = Math.max(0, MAX_IMAGES - imageCount);

  useEffect(() => {
    if (state.status !== "success") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedImages((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    setSelectedVideo((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, [state]);

  function syncImageInput(files: File[]) {
    if (!imageInputRef.current) return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    imageInputRef.current.files = transfer.files;
  }

  function selectImages(files: FileList | null) {
    if (!files) return;
    const slots = Math.max(0, remainingImages - selectedImages.length);
    if (slots === 0) return;
    const incoming = Array.from(files)
      .slice(0, slots)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    const merged = [...selectedImages, ...incoming];
    setSelectedImages(merged);
    syncImageInput(merged.map((item) => item.file));
  }

  function selectVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (selectedVideo) URL.revokeObjectURL(selectedVideo.url);
    const next = { file, url: URL.createObjectURL(file) };
    setSelectedVideo(next);
    if (videoInputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      videoInputRef.current.files = transfer.files;
    }
  }

  function removeSelectedImage(index: number) {
    const item = selectedImages[index];
    if (item) URL.revokeObjectURL(item.url);
    const next = selectedImages.filter((_, itemIndex) => itemIndex !== index);
    setSelectedImages(next);
    syncImageInput(next.map((entry) => entry.file));
  }

  function removeSelectedVideo() {
    if (selectedVideo) URL.revokeObjectURL(selectedVideo.url);
    setSelectedVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  return (
    <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl text-ink">Product media</h2>
        <p className="mt-1 text-sm text-muted">
          Up to {MAX_IMAGES} images and {MAX_VIDEOS} short video per product. The primary
          image appears on product cards.
        </p>
        <p className="mt-2 text-xs text-muted">
          {imageCount} of {MAX_IMAGES} images · {hasVideo ? "1 of 1 video" : "0 of 1 video"}
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
          No media yet. Upload up to {MAX_IMAGES} images and one short video below.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((image) => {
            const isVideo = productMediaType(image.storage_path) === "video";
            const src = productImageUrl(image.storage_path);

            return (
              <div
                key={image.id}
                className="overflow-hidden rounded-[12px] border border-border bg-background"
              >
                <div className="relative aspect-square">
                  {isVideo ? (
                    <video
                      src={src}
                      muted
                      playsInline
                      preload="metadata"
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={image.alt_text ?? "Product image"}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                    />
                  )}
                  {isVideo ? (
                    <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white">
                      <Film className="h-3 w-3" aria-hidden="true" />
                      Video
                    </span>
                  ) : null}
                  {image.is_primary ? (
                    <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      Primary
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 border-t border-border px-2 py-2">
                  {!isVideo && !image.is_primary ? (
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
                    <span className="px-1.5 text-[11px] text-muted">
                      {isVideo ? "Product video" : "Primary image"}
                    </span>
                  )}
                  <form action={deleteProductImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="productId" value={productId} />
                    <button
                      type="submit"
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-danger/10 hover:text-danger"
                      aria-label={isVideo ? "Delete video" : "Delete image"}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form action={formAction} className="mt-5 space-y-5 border-t border-border pt-5">
        <input type="hidden" name="productId" value={productId} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">Add images</p>
              <span className="text-[11px] text-muted">{remainingImages} slots left</span>
            </div>
            <input
              ref={imageInputRef}
              id="productImages"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="sr-only"
              onChange={(event) => selectImages(event.target.files)}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={remainingImages === 0}
              className="mt-2 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border bg-surface-soft/45 p-4 text-center transition-colors hover:border-primary/45 hover:bg-surface-soft/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-ink">
                {remainingImages === 0 ? "Image limit reached" : "Choose images"}
              </span>
              <span className="text-xs text-muted">JPG, PNG, WebP or AVIF · max 5 MB each</span>
            </button>

            {selectedImages.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {selectedImages.map((item, index) => (
                  <div
                    key={`${item.file.name}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-[10px] border border-border bg-surface-soft"
                  >
                    <Image
                      src={item.url}
                      alt="Selected image preview"
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/75 text-white hover:bg-danger"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">Add a short video</p>
              <span className="text-[11px] text-muted">
                {hasVideo ? "Video added" : "Optional"}
              </span>
            </div>
            <input
              ref={videoInputRef}
              id="productVideo"
              name="video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(event) => selectVideo(event.target.files)}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={hasVideo}
              className="mt-2 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border bg-surface-soft/45 p-4 text-center transition-colors hover:border-primary/45 hover:bg-surface-soft/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary">
                <Video className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-ink">
                {hasVideo ? "Video limit reached" : "Choose a video"}
              </span>
              <span className="text-xs text-muted">MP4, WebM or MOV · max 25 MB</span>
            </button>

            {selectedVideo ? (
              <div className="relative mt-3 overflow-hidden rounded-[10px] border border-border bg-surface-soft">
                <video
                  src={selectedVideo.url}
                  muted
                  playsInline
                  controls
                  className="h-32 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeSelectedVideo}
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/75 text-white hover:bg-danger"
                  aria-label="Remove selected video"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                Shown with the product gallery on the storefront.
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="outline"
          loading={isPending}
          disabled={selectedImages.length === 0 && !selectedVideo}
        >
          Upload media
        </Button>
      </form>
    </section>
  );
}
