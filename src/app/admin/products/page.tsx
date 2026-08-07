"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stockCount: number;
  isActive: boolean;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
};

type Category = { id: string; name: string };

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeProduct, setActiveProduct] = useState<AdminProduct | null>(null);

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
      prev
        ? prev.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...patch };
            // Keep the display category name in sync if categoryId changed.
            if (patch.categoryId) {
              const cat = categories.find((c) => c.id === patch.categoryId);
              if (cat) merged.categoryName = cat.name;
            }
            return merged;
          })
        : prev
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
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProduct(p)}
              className="group text-left border border-line bg-surface transition hover:border-accentSoft"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surface2">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {!p.isActive && (
                  <span className="absolute left-2 top-2 bg-bg/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                    Inactive
                  </span>
                )}
                {p.stockCount === 0 && (
                  <span className="absolute right-2 top-2 bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-bg">
                    Out of stock
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm text-ink">{p.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {p.categoryName}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-mono text-sm text-ink">
                    ₱{p.price.toLocaleString()}
                  </p>
                  <p className="font-mono text-xs text-muted">
                    {p.stockCount} in stock
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeProduct && (
        <ProductEditModal
          product={activeProduct}
          categories={categories}
          onClose={() => setActiveProduct(null)}
          onSave={async (patch) => {
            await updateProduct(activeProduct.id, patch);
            setActiveProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductEditModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: AdminProduct;
  categories: Category[];
  onClose: () => void;
  onSave: (patch: Partial<AdminProduct>) => Promise<void>;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stockCount, setStockCount] = useState(String(product.stockCount));
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [isActive, setIsActive] = useState(product.isActive);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      name,
      description,
      price: Number(price),
      stockCount: Number(stockCount),
      imageUrl,
      categoryId,
      isActive,
    });
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Edit Product</h2>
          <button
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="relative aspect-square w-full overflow-hidden bg-surface2">
            <Image
              src={imageUrl || product.imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>

          <div className="space-y-4">
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
                Image URL
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-mono text-xs uppercase tracking-wide text-muted">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
              Stock
            </label>
            <input
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div className="col-span-2">
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
        </div>

        <label className="mt-4 flex items-center gap-2 font-mono text-xs uppercase text-muted">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-accent"
          />
          Active (visible in shop)
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-ink hover:border-accentSoft"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent px-5 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}