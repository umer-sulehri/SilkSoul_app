import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories, listAdminProductOptions } from "@/lib/data/admin";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [categories, productOptions] = await Promise.all([
    listAdminCategories(),
    listAdminProductOptions(),
  ]);

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
        title="New product"
        description="Add the product details and primary image in one step."
      />
      <ProductForm
        categories={categories}
        productOptions={productOptions}
        withImageUpload
      />
    </div>
  );
}
