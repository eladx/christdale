"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Product } from "@/lib/products";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "christdale_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      const next = existing
        ? prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity,
            },
          ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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