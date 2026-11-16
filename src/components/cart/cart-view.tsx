"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout";
import { cartTotals } from "@/lib/pricing/cart";
import { cn, formatCurrency } from "@/lib/utils";

export function CartView({
  deliveryFee,
  freeThreshold,
  currency,
}: {
  deliveryFee: number;
  freeThreshold: number;
  currency: string;
}) {
  const { items, isHydrated, updateQuantity, removeItem, itemCount } = useCart();
  const totals = cartTotals(items, freeThreshold, deliveryFee);

  if (!isHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-3">
          {[0, 1].map((key) => (
            <div key={key} className="h-32 animate-pulse rounded-[16px] bg-surface-soft" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[16px] bg-surface-soft" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-6 w-6" aria-hidden="true" />}
        title="Your bag is empty"
        description="Explore the SilkSoul collection and add a product to begin your ritual."
        action={
          <Link href="/products" className={buttonVariants({ size: "md" })}>
            Shop the collection
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.45fr_0.75fr]">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
          </p>
          <Link href="/products" className="text-sm font-medium text-primary hover:text-primary-hover">
            Continue shopping
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-border rounded-[18px] border border-border bg-surface">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[12px] border border-border bg-surface-soft sm:h-28 sm:w-24"
              >
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain p-1.5" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-serif text-lg leading-snug text-ink hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted tabular-nums">
                      {formatCurrency(item.price, item.currency)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-danger/5 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                  <div className="inline-flex h-9 items-center rounded-[9px] border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="inline-flex h-full w-9 items-center justify-center rounded-l-[9px] text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      className="inline-flex h-full w-9 items-center justify-center rounded-r-[9px] text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {formatCurrency(item.price * item.quantity, item.currency)}
                  </p>
                </div>
                {item.quantity >= item.availableStock ? (
                  <p className="mt-2 text-[11px] text-warning">Maximum available quantity reached.</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="rounded-[18px] border border-border bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl text-ink">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-ink">{formatCurrency(totals.subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd className="tabular-nums text-ink">
              {totals.deliveryFee === 0 ? "Free" : formatCurrency(totals.deliveryFee, currency)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-ink">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(totals.total, currency)}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-[12px] bg-surface-soft p-3.5 text-xs text-muted">
          <p className="flex items-center gap-2 font-medium text-ink">
            <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
            {totals.remainingForFreeDelivery > 0
              ? `${formatCurrency(totals.remainingForFreeDelivery, currency)} away from free delivery`
              : "You have unlocked free delivery"}
          </p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{
                width: `${Math.min(100, Math.round((totals.subtotal / freeThreshold) * 100))}%`,
              }}
            />
          </div>
        </div>

        <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}>
          Checkout
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          Totals and stock are verified on the server before your order is placed.
        </p>
      </aside>
    </div>
  );
}
