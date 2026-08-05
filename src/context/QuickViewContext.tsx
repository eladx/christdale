"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Product } from "@/lib/products";

type QuickViewContextValue = {
  product: Product | null;
  isOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = useCallback((p: Product) => {
    setProduct(p);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{ product, isOpen, openQuickView, closeQuickView }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx)
    throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}