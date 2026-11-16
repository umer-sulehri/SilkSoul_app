import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/env";
import { listProducts } from "@/lib/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const products = await listProducts();

  const staticRoutes = [
    "",
    "/products",
    "/about",
    "/contact",
    "/faq",
    "/track-order",
    "/cart",
    "/policies/privacy",
    "/policies/shipping",
    "/policies/returns",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.6,
  }));

  const productRoutes = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
