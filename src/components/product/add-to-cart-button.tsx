"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = "md",
  label = "Add to cart",
  variant = "primary",
}: {
  product: Product;
  quantity?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  variant?: "primary" | "outline" | "secondary";
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.availableStock <= 0;

  const handleAdd = () => {
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
    setAdded(true);
    toast.success(`${product.name} added to your bag`, {
      description: "You can adjust quantities in your cart.",
    });
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      variant={variant}
      size={size}
      className={cn("group", className)}
      aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
    >
      {added ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      )}
      {outOfStock ? "Out of stock" : added ? "Added" : label}
    </Button>
  );
}
