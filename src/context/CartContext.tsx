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

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}