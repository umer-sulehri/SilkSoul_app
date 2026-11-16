import { supabaseConfig } from "@/lib/env";

export function productImageUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `${supabaseConfig.url}/storage/v1/object/public/product-images/${path}`;
}
