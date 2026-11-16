import Link from "next/link";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Container } from "@/components/ui/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCategories, listProducts } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import type { ProductFilters } from "@/types/catalog";

export const metadata = {
  title: "Shop all products",
  description:
    "Explore SILK Soul natural haircare — a botanical hair oil and a sulphate-free milky shampoo.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(params: Record<string, string | string[] | undefined>): ProductFilters {
  const availability = first(params.availability);
  const sort = first(params.sort);
  return {
    search: first(params.q) ?? "",
    category: first(params.category) ?? "",
    availability:
      availability === "in-stock" || availability === "out-of-stock" ? availability : "all",
    sort:
      sort === "price-asc" ||
      sort === "price-desc" ||
      sort === "name-asc" ||
      sort === "newest"
        ? sort
        : "featured",
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [products, categories] = await Promise.all([listProducts(filters), getCategories()]);
  const hasFilters = Boolean(
    filters.search || filters.category || filters.availability !== "all" || filters.sort !== "featured",
  );

  return (
    <div className="pb-24">
      <section className="border-b border-border bg-surface-soft/40 py-14 sm:py-18">
        <Container>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            The collection
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Thoughtful haircare, simply made.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Two essentials for a softer, stronger-feeling hair ritual. Explore the range,
            compare formulas and choose what your hair needs.
          </p>
        </Container>
      </section>

      <Container className="pt-10">
        <form
          className="rounded-[18px] border border-border bg-surface p-4 sm:p-5"
          action="/products"
          method="get"
          role="search"
          aria-label="Filter products"
        >
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
            <div>
              <label htmlFor="product-search" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  id="product-search"
                  name="q"
                  defaultValue={filters.search}
                  placeholder="Search products"
                  className="h-11 w-full rounded-[10px] border border-border bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={filters.category}
                className="h-11 w-full rounded-[10px] border border-border bg-surface px-3.5 text-sm text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="availability" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Availability
              </label>
              <select
                id="availability"
                name="availability"
                defaultValue={filters.availability}
                className="h-11 w-full rounded-[10px] border border-border bg-surface px-3.5 text-sm text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="all">All products</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Sort
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={filters.sort}
                className="h-11 w-full rounded-[10px] border border-border bg-surface px-3.5 text-sm text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <Button type="submit" className="w-full lg:w-auto">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Apply
            </Button>
          </div>

          {hasFilters ? (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                Filters applied
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear all
              </Link>
            </div>
          ) : null}
        </form>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <p className="hidden text-xs text-muted sm:block">Prices in PKR · Taxes included</p>
        </div>

        {products.length > 0 ? (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-[18px] border border-dashed border-border bg-surface-soft/40 px-6 py-20 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-serif text-2xl text-ink">No products match your filters</h2>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Try a different search, or clear the filters to see the full collection.
            </p>
            <Link href="/products" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
              Clear filters
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
