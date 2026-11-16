"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StockStatus } from "@/components/ui/price";
import { useCart } from "@/components/cart/cart-provider";
import { clamp } from "@/lib/utils";
import type { Product } from "@/types/catalog";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.availableStock <= 0;
  const max = Math.max(1, product.availableStock);

  const add = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        image: product.images[0]?.path ?? "",
        availableStock: product.availableStock,
      },
      quantity,
    );
  };

  const handleAdd = () => {
    add();
    toast.success(`${product.name} added to your bag`, {
      description: `${quantity} × ${product.name}`,
    });
  };

  const handleBuyNow = () => {
    add();
    router.push("/checkout");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StockStatus available={product.availableStock} threshold={product.lowStockThreshold} />
        <span className="text-xs text-muted tabular-nums">
          {product.sku} · {product.availableStock} available
        </span>
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium text-ink">Quantity</span>
        <div className="inline-flex h-11 items-center rounded-[10px] border border-border bg-surface">
          <button
            type="button"
            onClick={() => setQuantity((value) => clamp(value - 1, 1, max))}
            disabled={outOfStock || quantity <= 1}
            className="inline-flex h-full w-11 items-center justify-center rounded-l-[10px] text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="w-12 text-center text-sm font-semibold tabular-nums"
            aria-live="polite"
            aria-label={`Quantity: ${quantity}`}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => clamp(value + 1, 1, max))}
            disabled={outOfStock || quantity >= max}
            className="inline-flex h-full w-11 items-center justify-center rounded-r-[10px] text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <Button type="button" size="lg" onClick={handleAdd} disabled={outOfStock}>
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={handleBuyNow}
          disabled={outOfStock}
        >
          Buy now
        </Button>
      </div>

      <div className="mt-6 space-y-2.5 rounded-[14px] border border-border bg-surface-soft/50 p-4 text-xs text-muted">
        <p className="flex items-center gap-2">
          <Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Delivery calculated at checkout. Free over Rs 5,000.
        </p>
        <p className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Cash on delivery available across Pakistan.
        </p>
      </div>
    </div>
  );
}
