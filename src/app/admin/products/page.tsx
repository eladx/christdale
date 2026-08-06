"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  isActive: boolean;
  imageUrl: string;
  categoryName: string;
};

type Category = { id: string; name: string };

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockCount, setStockCount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function authHeader() {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
  }

  async function loadProducts() {
    const headers = await authHeader();
    const res = await fetch("/api/admin/products", { headers });
    const result = await res.json();
    setProducts(result.products ?? []);
    setCategories(result.categories ?? []);
    if (result.categories?.[0]) setCategoryId(result.categories[0].id);
  }

  useEffect(() => {
    if (user && isAdmin) loadProducts();
  }, [user, isAdmin]);

  async function updateProduct(id: string, patch: Partial<AdminProduct>) {
    const headers = await authHeader();
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setProducts((prev) =>
      prev ? prev.map((p) => (p.id === id ? { ...p, ...patch } : p)) : prev
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !price || !imageUrl || !categoryId) {
      setError("Fill in name, price, image URL, and category.");
      return;
    }
    setCreating(true);
    const headers = await authHeader();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: Number(price),
        stockCount: Number(stockCount) || 0,
        imageUrl,
        categoryId,
      }),
    });
    const result = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(result.error ?? "Failed to create product.");
      return;
    }

    setName("");
    setDescription("");
    setPrice("");
    setStockCount("");
    setImageUrl("");
    setShowForm(false);
    loadProducts();
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center sm:px-8">
        <h1 className="font-display text-3xl text-ink">Not Authorized</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
            Admin
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            Products
          </h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-4 border border-line bg-surface p-6"
        >
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Price (₱)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Stock Count
              </label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Image URL
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Product"}
          </button>
        </form>
      )}

      {products === null && <p className="mt-10 text-sm text-muted">Loading…</p>}

      {products && (
        <div className="mt-10 space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-4 border border-line bg-surface p-4"
            >
              <div className="min-w-[160px] flex-1">
                <p className="text-sm text-ink">{p.name}</p>
                <p className="font-mono text-xs text-muted">
                  {p.categoryName}
                </p>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted">
                  Price
                </label>
                <input
                  type="number"
                  defaultValue={p.price}
                  onBlur={(e) =>
                    updateProduct(p.id, { price: Number(e.target.value) })
                  }
                  className="w-24 border border-line bg-surface2 px-2 py-1 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted">
                  Stock
                </label>
                <input
                  type="number"
                  defaultValue={p.stockCount}
                  onBlur={(e) =>
                    updateProduct(p.id, {
                      stockCount: Number(e.target.value),
                    })
                  }
                  className="w-20 border border-line bg-surface2 px-2 py-1 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 font-mono text-xs uppercase text-muted">
                <input
                  type="checkbox"
                  checked={p.isActive}
                  onChange={(e) =>
                    updateProduct(p.id, { isActive: e.target.checked })
                  }
                  className="accent-accent"
                />
                Active
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
