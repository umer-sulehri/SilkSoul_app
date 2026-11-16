"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types/catalog";
import { clamp } from "@/lib/utils";

const STORAGE_KEY = "silksoul.cart.v1";

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.currency === "string" &&
    typeof item.image === "string" &&
    typeof item.quantity === "number" &&
    typeof item.availableStock === "number"
  );
}

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Hydrate the persisted cart after mount so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setItems(readCart());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((entry) => entry.productId === item.productId);
        if (existing) {
          return current.map((entry) =>
            entry.productId === item.productId
              ? {
                  ...entry,
                  ...item,
                  quantity: clamp(
                    entry.quantity + quantity,
                    1,
                    Math.max(1, item.availableStock),
                  ),
                }
              : entry,
          );
        }
        return [
          ...current,
          {
            ...item,
            quantity: clamp(quantity, 1, Math.max(1, item.availableStock)),
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.map((entry) =>
        entry.productId === productId
          ? {
              ...entry,
              quantity: clamp(quantity, 1, Math.max(1, entry.availableStock)),
            }
          : entry,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    return {
      items,
      isHydrated,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      setQuantity: updateQuantity,
      clearCart,
    };
  }, [items, isHydrated, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
