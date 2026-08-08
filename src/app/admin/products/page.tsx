"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import AdminProductModal, { type AdminProduct } from "@/components/AdminProductModal";
import CategoryManagerModal from "@/components/CategoryManagerModal";

type Category = { id: string; name: string };

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null | undefined>(
    undefined
  ); // undefined = closed, null = create mode, object = edit mode
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  async function loadProducts() {
    const headers = await authHeader();
    const res = await fetch("/api/admin/products", { headers });
    const result = await res.json();
    setProducts(result.products ?? []);
    setCategories(result.categories ?? []);
  }

  useEffect(() => {
    if (user && isAdmin) loadProducts();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Not Authorized</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
            Admin
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            Products
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft"
          >
            Categories
          </button>
          <button
            onClick={() => setEditingProduct(null)}
            className="bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90"
          >
            + Add Product
          </button>
        </div>
      </div>

      {products === null && <p className="mt-10 text-sm text-muted">Loading…</p>}

      {products && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setEditingProduct(p)}
              className="group border border-line bg-surface text-left transition-colors hover:border-accentSoft"
            >
              <div className="relative aspect-square overflow-hidden bg-surface2">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {!p.isActive && (
                  <span className="absolute left-2 top-2 bg-bg/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                    Inactive
                  </span>
                )}
                {p.stockCount === 0 && (
                  <span className="absolute right-2 top-2 bg-accent/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-bg">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm text-ink">{p.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  ₱{p.price.toLocaleString()} · Stock {p.stockCount}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {editingProduct !== undefined && (
        <AdminProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(undefined)}
          onSaved={loadProducts}
        />
      )}

      {showCategoryManager && (
        <CategoryManagerModal
          onClose={() => setShowCategoryManager(false)}
          onChanged={loadProducts}
        />
      )}
    </div>
  );
}
