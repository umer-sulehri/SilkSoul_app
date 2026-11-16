import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImages } from "@/components/admin/product-images";
import {
  getAdminProduct,
  listAdminCategories,
  listAdminProductOptions,
} from "@/lib/data/admin";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, productOptions] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
    listAdminProductOptions(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Products
      </Link>
      <AdminPageHeader
        eyebrow="Catalog"
        title={product.name}
        description={`${product.sku} · ${product.stock_on_hand} on hand · ${product.stock_reserved} reserved`}
        action={
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-medium text-ink hover:bg-surface-soft"
          >
            View product
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ProductForm
          product={product}
          categories={categories}
          productOptions={productOptions}
        />
        <div className="space-y-5">
          <ProductImages productId={product.id} images={product.product_images ?? []} />
          <div className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-serif text-lg text-ink">Inventory</h2>
            <p className="mt-1 text-sm text-muted">
              Available stock is calculated as on-hand minus reserved.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">On hand</dt>
                <dd className="tabular-nums text-ink">{product.stock_on_hand}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Reserved</dt>
                <dd className="tabular-nums text-ink">{product.stock_reserved}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-2">
                <dt className="font-medium text-ink">Available</dt>
                <dd className="font-semibold tabular-nums text-ink">
                  {product.stock_on_hand - product.stock_reserved}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/inventory/${product.id}`}
              className="mt-4 inline-flex text-xs font-medium text-primary hover:underline"
            >
              Adjust stock
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
