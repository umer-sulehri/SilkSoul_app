"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageUploadField({
  id = "image",
  name = "image",
  label = "Image",
  hint = "JPG, PNG, WebP or AVIF. Maximum 5 MB.",
  required = false,
  className,
  currentSrc,
  onFileChange,
}: {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  currentSrc?: string | null;
  onFileChange?: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const imageSrc = preview ?? currentSrc ?? null;
  const hasImage = Boolean(imageSrc);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function chooseFile() {
    inputRef.current?.click();
  }

  function clearFile() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setFileName(null);
    onFileChange?.(null);
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{label}</p>
        {fileName ? (
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-danger"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        required={required}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            setPreview(null);
            setFileName(null);
            onFileChange?.(null);
            return;
          }
          setPreview(URL.createObjectURL(file));
          setFileName(file.name);
          onFileChange?.(file);
        }}
      />

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={chooseFile}
          className={cn(
            "group relative flex min-h-28 flex-1 items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-border bg-surface-soft/45 p-3 text-center transition-colors hover:border-primary/45 hover:bg-surface-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            hasImage ? "border-solid" : "",
          )}
        >
          {imageSrc ? (
            <>
              <Image
                src={imageSrc}
                alt="Selected image preview"
                fill
                unoptimized
                sizes="(max-width: 640px) 90vw, 360px"
                className="object-contain p-2"
              />
              <span className="absolute bottom-2 left-2 right-2 truncate rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                {fileName ?? "Current image"}
              </span>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-ink">Choose an image</span>
              <span className="text-xs text-muted">{hint}</span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={chooseFile}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {hasImage ? "Change image" : "Browse images"}
        </button>
      </div>
    </div>
  );
}
