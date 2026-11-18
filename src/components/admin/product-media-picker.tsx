"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Play, Video, X } from "lucide-react";
import { FieldError } from "@/components/ui/label";

const MAX_IMAGES = 5;

type SelectedFile = {
  file: File;
  url: string;
};

export function ProductMediaPicker({
  errors,
}: {
  errors?: { images?: string; video?: string };
}) {
  const [images, setImages] = useState<SelectedFile[]>([]);
  const [video, setVideo] = useState<SelectedFile | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function syncImageInput(files: File[]) {
    if (!imageInputRef.current) return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    imageInputRef.current.files = transfer.files;
  }

  function selectImages(fileList: FileList | null) {
    if (!fileList) return;
    const slots = Math.max(0, MAX_IMAGES - images.length);
    if (slots === 0) return;
    const incoming = Array.from(fileList)
      .slice(0, slots)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    const merged = [...images, ...incoming];
    setImages(merged);
    syncImageInput(merged.map((item) => item.file));
  }

  function removeImage(index: number) {
    const item = images[index];
    if (item) URL.revokeObjectURL(item.url);
    const next = images.filter((_, itemIndex) => itemIndex !== index);
    setImages(next);
    syncImageInput(next.map((entry) => entry.file));
  }

  function selectVideo(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (video) URL.revokeObjectURL(video.url);
    setVideo({ file, url: URL.createObjectURL(file) });
    if (videoInputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      videoInputRef.current.files = transfer.files;
    }
  }

  function removeVideo() {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">Product images</p>
          <span className="text-[11px] text-muted">
            {images.length} of {MAX_IMAGES} selected
          </span>
        </div>
        <input
          ref={imageInputRef}
          id="newProductImages"
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
          disabled={images.length >= MAX_IMAGES}
          className="mt-2 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border bg-surface-soft/45 p-4 text-center transition-colors hover:border-primary/45 hover:bg-surface-soft/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary">
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-ink">
            {images.length >= MAX_IMAGES ? "Image limit reached" : "Choose up to 5 images"}
          </span>
          <span className="text-xs text-muted">JPG, PNG, WebP or AVIF · max 5 MB each</span>
        </button>
        <FieldError message={errors?.images} />

        {images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((item, index) => (
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
                {index === 0 ? (
                  <span className="absolute bottom-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-semibold text-white">
                    Primary
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
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
          <p className="text-sm font-medium text-ink">Short video</p>
          <span className="text-[11px] text-muted">{video ? "1 selected" : "Optional"}</span>
        </div>
        <input
          ref={videoInputRef}
          id="newProductVideo"
          name="video"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(event) => selectVideo(event.target.files)}
        />
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={Boolean(video)}
          className="mt-2 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-border bg-surface-soft/45 p-4 text-center transition-colors hover:border-primary/45 hover:bg-surface-soft/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary">
            <Video className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-ink">
            {video ? "Video selected" : "Choose one short video"}
          </span>
          <span className="text-xs text-muted">MP4, WebM or MOV · max 25 MB</span>
        </button>
        <FieldError message={errors?.video} />

        {video ? (
          <div className="relative mt-3 overflow-hidden rounded-[10px] border border-border bg-surface-soft">
            <video
              src={video.url}
              muted
              playsInline
              controls
              className="h-32 w-full object-contain"
            />
            <button
              type="button"
              onClick={removeVideo}
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
  );
}
