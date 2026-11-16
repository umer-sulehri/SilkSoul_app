"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import {
  saveProductAction,
  type ProductActionState,
} from "@/app/admin/actions/products";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FieldError, HelperText, Label } from "@/components/ui/label";
import type { AdminProduct, AdminProductOption } from "@/lib/data/admin";

const initialState: ProductActionState = { status: "idle" };

function listToText(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").join("\n")
    : "";
}

function specsToText(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (
          item &&
          typeof item === "object" &&
          "label" in item &&
          "value" in item &&
          typeof item.label === "string" &&
          typeof item.value === "string"
        ) {
          return [`${item.label}: ${item.value}`];
        }
        return [];
      })
      .join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .flatMap(([label, entry]) =>
        typeof entry === "string" || typeof entry === "number"
          ? [`${label}: ${entry}`]
          : [],
      )
      .join("\n");
  }
  return "";
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-serif text-xl text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}


function ColorField({
  id,
  name,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
          aria-label={`${label} colour picker`}
        />
        <Input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          spellCheck={false}
          aria-invalid={Boolean(error)}
          className="font-mono uppercase"
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function ThemeFields({
  defaults,
  errors,
}: {
  defaults: { primary: string; accent: string; soft: string };
  errors: Record<string, string> | undefined;
}) {
  const [primary, setPrimary] = useState(defaults.primary);
  const [accent, setAccent] = useState(defaults.accent);
  const [soft, setSoft] = useState(defaults.soft);

  return (
    <>
      <ColorField
        id="themePrimary"
        name="themePrimary"
        label="Primary colour"
        value={primary}
        onChange={setPrimary}
        error={errors?.themePrimary}
      />
      <ColorField
        id="themeAccent"
        name="themeAccent"
        label="Accent colour"
        value={accent}
        onChange={setAccent}
        error={errors?.themeAccent}
      />
      <ColorField
        id="themeSoft"
        name="themeSoft"
        label="Soft background"
        value={soft}
        onChange={setSoft}
        error={errors?.themeSoft}
      />
      <div className="flex items-end">
        <div
          className="flex h-11 w-full items-center gap-2 rounded-[10px] border border-border px-3"
          style={{ background: soft, color: primary }}
        >
          <span
            className="h-5 w-5 rounded-full"
            style={{ background: accent }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium">Live palette preview</span>
        </div>
      </div>
    </>
  );
}

export function ProductForm({
  product,
  categories,
  productOptions,
}: {
  product?: AdminProduct | null;
  categories: { id: string; name: string }[];
  productOptions: AdminProductOption[];
}) {
  const [state, formAction, isPending] = useActionState(saveProductAction, initialState);
  const isEdit = Boolean(product);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {state.message ? (
        <div
          className={
            state.status === "error"
              ? "rounded-[12px] border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-ink"
              : "rounded-[12px] border border-success/25 bg-success/5 px-4 py-3 text-sm text-ink"
          }
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <Section title="Product basics" description="How this product appears in the catalog.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              required
              aria-invalid={Boolean(state.fieldErrors?.name)}
            />
            <FieldError message={state.fieldErrors?.name} />
          </div>

          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="natural-hair-oil"
              required
              aria-invalid={Boolean(state.fieldErrors?.slug)}
            />
            <FieldError message={state.fieldErrors?.slug} />
            <HelperText>Lowercase letters, numbers and hyphens only.</HelperText>
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="SS-HO-200"
              required
              aria-invalid={Boolean(state.fieldErrors?.sku)}
            />
            <FieldError message={state.fieldErrors?.sku} />
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={product?.category_id ?? ""}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <FieldError message={state.fieldErrors?.categoryId} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                defaultValue={product ? Number(product.price) : ""}
                required
                aria-invalid={Boolean(state.fieldErrors?.price)}
              />
              <FieldError message={state.fieldErrors?.price} />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Compare at</Label>
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.compare_at_price ? Number(product.compare_at_price) : ""}
                placeholder="Optional"
              />
              <FieldError message={state.fieldErrors?.compareAtPrice} />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.short_description ?? ""}
              maxLength={240}
            />
            <FieldError message={state.fieldErrors?.shortDescription} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isEdit ? (
              <div>
                <Label htmlFor="stockOnHand">Stock on hand</Label>
                <Input id="stockOnHand" value={product?.stock_on_hand ?? 0} disabled />
                <HelperText>Adjust stock from the inventory page.</HelperText>
              </div>
            ) : (
              <div>
                <Label htmlFor="stockOnHand">Opening stock</Label>
                <Input
                  id="stockOnHand"
                  name="stockOnHand"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={0}
                />
                <FieldError message={state.fieldErrors?.stockOnHand} />
              </div>
            )}
            <div>
              <Label htmlFor="lowStockThreshold">Low stock alert at</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.low_stock_threshold ?? 5}
              />
              <FieldError message={state.fieldErrors?.lowStockThreshold} />
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={product?.description ?? ""}
            />
            <FieldError message={state.fieldErrors?.description} />
          </div>
        </div>
      </Section>

      <Section
        title="Product story"
        description="One benefit or ingredient per line. Specifications use “Label: Value”."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              name="benefits"
              rows={7}
              defaultValue={listToText(product?.benefits)}
              placeholder={"Nourishes the scalp\nImproves softness"}
            />
            <FieldError message={state.fieldErrors?.benefits} />
          </div>
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              rows={7}
              defaultValue={listToText(product?.ingredients)}
              placeholder={"Rosemary oil\nCoconut oil"}
            />
            <FieldError message={state.fieldErrors?.ingredients} />
          </div>
          <div>
            <Label htmlFor="usageInstructions">How to use</Label>
            <Textarea
              id="usageInstructions"
              name="usageInstructions"
              rows={6}
              defaultValue={product?.usage_instructions ?? ""}
            />
            <FieldError message={state.fieldErrors?.usageInstructions} />
          </div>
          <div>
            <Label htmlFor="specifications">Specifications</Label>
            <Textarea
              id="specifications"
              name="specifications"
              rows={6}
              defaultValue={specsToText(product?.specifications)}
              placeholder={"Size: 200 ml\nHair type: All hair types"}
            />
            <FieldError message={state.fieldErrors?.specifications} />
          </div>
        </div>
      </Section>


      <Section
        title="Companion product & page theme"
        description="Choose the second product shown beside this one, and the colours used across this product’s page."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="companionProductId">Companion product</Label>
            <Select
              id="companionProductId"
              name="companionProductId"
              defaultValue={product?.companion_product_id ?? ""}
              aria-invalid={Boolean(state.fieldErrors?.companionProductId)}
            >
              <option value="">No companion product</option>
              {productOptions
                .filter((option) => option.id !== product?.id)
                .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} · {option.sku}
                    {option.is_active ? "" : " (draft)"}
                  </option>
                ))}
            </Select>
            <FieldError message={state.fieldErrors?.companionProductId} />
            <HelperText>
              Its details open in a side popup on this product’s storefront page.
            </HelperText>
          </div>

          <ThemeFields
            defaults={{
              primary: product?.theme_primary ?? "#3e5a44",
              accent: product?.theme_accent ?? "#c19a5b",
              soft: product?.theme_soft ?? "#e9efe1",
            }}
            errors={state.fieldErrors}
          />
        </div>
      </Section>

      <Section title="Search and visibility">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" name="seoTitle" defaultValue={product?.seo_title ?? ""} />
            <FieldError message={state.fieldErrors?.seoTitle} />
          </div>
          <div>
            <Label htmlFor="seoDescription">SEO description</Label>
            <Input
              id="seoDescription"
              name="seoDescription"
              defaultValue={product?.seo_description ?? ""}
            />
            <FieldError message={state.fieldErrors?.seoDescription} />
          </div>
          <label className="flex items-start gap-3 rounded-[10px] border border-border p-3 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product?.is_active ?? true}
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="font-medium text-ink">Active</span>
              <span className="mt-0.5 block text-xs text-muted">
                Visible on the storefront.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-[10px] border border-border p-3 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.is_featured ?? false}
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="font-medium text-ink">Featured</span>
              <span className="mt-0.5 block text-xs text-muted">
                Surfaced on the homepage and first in the catalog.
              </span>
            </span>
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={isPending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Link
          href="/admin/products"
          className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
