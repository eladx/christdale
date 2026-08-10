"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { computeVariantKey } from "@/lib/variant";

type CartItem = {
  productId: string;
  variantKey: string;
  selectedOptions: Record<string, string> | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>
  ) => void;
  removeItem: (productId: string, variantKey?: string) => void;
  updateQuantity: (productId: string, variantKey: string, quantity: number) => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const headers = await authHeader();
    const res = await fetch("/api/cart", { headers });
    const data = await res.json();
    setItems(data.items ?? []);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optimistic: update local state immediately so the UI feels instant,
  // then sync with the server in the background. On failure, re-fetch
  // to correct any drift instead of leaving the UI wrong.
  const addItem = useCallback(
    (product: Product, quantity: number = 1, selectedOptions?: Record<string, string>) => {
      const variantKey = computeVariantKey(selectedOptions);

      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === product.id && i.variantKey === variantKey
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id && i.variantKey === variantKey
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            variantKey,
            selectedOptions: selectedOptions ?? null,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
          },
        ];
      });

      (async () => {
        const headers = await authHeader();
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity, selectedOptions }),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items ?? []);
        } else {
          refresh();
        }
      })();
    },
    [refresh]
  );

  const removeItem = useCallback(
    (productId: string, variantKey: string = "") => {
      setItems((prev) =>
        prev.filter((i) => !(i.productId === productId && i.variantKey === variantKey))
      );
      (async () => {
        const headers = await authHeader();
        const res = await fetch(
          `/api/cart/item?productId=${productId}&variantKey=${encodeURIComponent(variantKey)}`,
          { method: "DELETE", headers }
        );
        if (!res.ok) refresh();
      })();
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    (productId: string, variantKey: string, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => !(i.productId === productId && i.variantKey === variantKey))
          : prev.map((i) =>
              i.productId === productId && i.variantKey === variantKey
                ? { ...i, quantity }
                : i
            )
      );
      (async () => {
        const headers = await authHeader();
        const res = await fetch("/api/cart/item", {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ productId, variantKey, quantity }),
        });
        if (!res.ok) refresh();
      })();
    },
    [refresh]
  );

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
