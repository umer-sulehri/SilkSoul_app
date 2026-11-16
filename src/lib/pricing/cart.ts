import type { CartItem } from "@/types/catalog";

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function estimatedDeliveryFee(subtotal: number, freeThreshold: number, fee: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= freeThreshold ? 0 : fee;
}

export function cartTotals(items: CartItem[], freeThreshold: number, fee: number) {
  const subtotal = cartSubtotal(items);
  const deliveryFee = estimatedDeliveryFee(subtotal, freeThreshold, fee);
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    remainingForFreeDelivery: Math.max(0, freeThreshold - subtotal),
  };
}
