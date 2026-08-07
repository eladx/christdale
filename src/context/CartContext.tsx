"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

type CartItem = { productId: string; name: string; price: number; image: string; quantity: number };

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  removeItems: (productIds: string[]) => void;
  total: number;
  count: number;
  selected: Set<string>;
  toggleSelect: (productId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectedItems: CartItem[];
  selectedTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  // Tracks items the customer has unchecked for this checkout. Inverting
  // the set (rather than tracking "selected") means newly added cart
  // items default to selected without any extra sync-on-change logic.
  const [deselected, setDeselected] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const headers = await authHeader();
    const res = await fetch("/api/cart", { headers });
    const data = await res.json();
    setItems(data.items ?? []);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    const headers = await authHeader();
    await fetch("/api/cart", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity }),
    });
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (productId: string) => {
    const headers = await authHeader();
    await fetch(`/api/cart/item?productId=${productId}`, { method: "DELETE", headers });
    await refresh();
  }, [refresh]);

  const removeItems = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) return;
    const headers = await authHeader();
    await fetch("/api/cart/items", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    });
    await refresh();
  }, [refresh]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const toggleSelect = useCallback((productId: string) => {
    setDeselected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => setDeselected(new Set()), []);
  const deselectAll = useCallback(
    () => setDeselected(new Set(items.map((i) => i.productId))),
    [items]
  );

  const selected = new Set(
    items.filter((i) => !deselected.has(i.productId)).map((i) => i.productId)
  );
  const selectedItems = items.filter((i) => !deselected.has(i.productId));
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        removeItems,
        total,
        count,
        selected,
        toggleSelect,
        selectAll,
        deselectAll,
        selectedItems,
        selectedTotal,
      }}
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