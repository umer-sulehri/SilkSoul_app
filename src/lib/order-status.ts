import type { OrderStatus } from "@/types/database";

export const orderLifecycle: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "returned",
];

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "processing", "shipped", "delivered", "cancelled"],
  confirmed: ["processing", "shipped", "delivered", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["returned"],
  cancelled: [],
  returned: ["shipped"],
};

export function orderStatusPath(
  from: OrderStatus,
  to: OrderStatus,
): OrderStatus[] | null {
  if (from === to) return [];

  if (!orderStatusTransitions[from].includes(to)) return null;

  if (to === "cancelled" || to === "returned") return [to];

  if (from === "returned" && to === "shipped") return [to];

  const fromIndex = orderLifecycle.indexOf(from);
  const toIndex = orderLifecycle.indexOf(to);
  if (fromIndex === -1 || toIndex <= fromIndex) return null;

  return orderLifecycle.slice(fromIndex + 1, toIndex + 1);
}
