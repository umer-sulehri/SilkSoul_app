"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Film, Play, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement>(null);
  const current = images[active] ?? images[0];
  const isVideo = current?.mediaType === "video";

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (isVideo) return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div>
      <div
        ref={frameRef}
        onMouseEnter={() => !isVideo && setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMove}
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-[22px] border border-border bg-surface-soft",
          !isVideo && "cursor-zoom-in",
        )}
      >
        {current ? (
          isVideo ? (
            <video
              key={current.path}
              src={current.path}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-contain p-4 sm:p-8"
              aria-label={`${productName} product video`}
            />
          ) : (
            <Image
              key={current.path}
              src={current.path}
              alt={current.alt || productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className={cn(
                "object-contain p-4 transition-transform duration-200 ease-out sm:p-8",
                zoomed ? "scale-[2]" : "scale-100",
              )}
              style={{ transformOrigin: origin }}
            />
          )
        ) : null}

        {!isVideo ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-2.5 py-1 text-[10px] font-medium text-muted backdrop-blur">
              <ZoomIn className="h-3 w-3" aria-hidden="true" />
              Hover to zoom
            </span>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <span className="rounded-full border border-border bg-surface/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted backdrop-blur">
            {isVideo ? "Product video" : `Actual label · ${productName}`}
          </span>
        </div>
      </div>

      {images.length > 1 ? (
        <div
          className="mt-3 flex flex-wrap gap-2.5"
          role="group"
          aria-label="Product media"
        >
          {images.map((image, index) => {
            const video = image.mediaType === "video";

            return (
              <button
                key={image.id}
                type="button"
                aria-pressed={index === active}
                onClick={() => {
                  setActive(index);
                  setZoomed(false);
                }}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border bg-surface-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-20 sm:w-20",
                  index === active
                    ? "border-primary"
                    : "border-border hover:border-primary/40",
                )}
                aria-label={
                  video
                    ? `Show product video ${productName}`
                    : `Show image ${index + 1} of ${productName}`
                }
              >
                {video ? (
                  <>
                    <video
                      src={image.path}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/25">
                      <Play className="h-5 w-5 fill-white text-white" aria-hidden="true" />
                    </span>
                    <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-ink/70 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                      <Film className="h-2.5 w-2.5" aria-hidden="true" />
                      Video
                    </span>
                  </>
                ) : (
                  <Image
                    src={image.path}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
