import { supabaseConfig } from "@/lib/env";

export type ProductMediaType = "image" | "video";

const videoExtensions = new Set(["mp4", "webm", "mov", "m4v", "ogv", "ogg"]);

export function productMediaType(path: string): ProductMediaType {
  const clean = path.split("?")[0]?.split("#")[0] ?? path;
  const extension = clean.split(".").pop()?.toLowerCase() ?? "";
  return videoExtensions.has(extension) ? "video" : "image";
}

export function productImageUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `${supabaseConfig.url}/storage/v1/object/public/product-images/${path}`;
}
