"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/supabase/storage";

export type AdminProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockCount: number;
  isActive: boolean;
  imageUrl: string;
  categoryId?: string;
  categoryName: string;
  variations?: { name: string; options: string[] }[];
};

type Category = { id: string; name: string };

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export default function AdminProductModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null; // null = create mode
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stockCount, setStockCount] = useState(String(product?.stockCount ?? "0"));
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? ""
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [variations, setVariations] = useState<{ name: string; optionsText: string }[]>(
    (product?.variations ?? []).map((v) => ({
      name: v.name,
      optionsText: v.options.join(", "),
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch (err) {
      setError(
        "Upload failed — make sure the 'products' Storage bucket exists and is public. " +
          (err instanceof Error ? err.message : "")
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setError("");
    if (!name || !price || !imageUrl || !categoryId) {
      setError("Name, price, image, and category are required.");
      return;
    }
    setSaving(true);
    const headers = await authHeader();

    const cleanedVariations = variations
      .filter((v) => v.name.trim() && v.optionsText.trim())
      .map((v) => ({
        name: v.name.trim(),
        options: v.optionsText
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      }));

    if (product) {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          stockCount: Number(stockCount),
          categoryId,
          imageUrl,
          isActive,
          variations: cleanedVariations,
        }),
      });
    } else {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          stockCount: Number(stockCount),
          categoryId,
          imageUrl,
          variations: cleanedVariations,
        }),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Failed to create product.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const headers = await authHeader();
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
      headers,
    });
    const result = await res.json();
    setDeleting(false);

    if (!res.ok) {
      setError(result.error ?? "Failed to delete product.");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-sm text-muted hover:text-ink"
          >
            CLOSE
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
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
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
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
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
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
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Image
              </label>
              <div className="flex gap-1 font-mono text-xs uppercase">
                <button
                  onClick={() => setImageMode("url")}
                  className={`px-2 py-1 ${
                    imageMode === "url" ? "text-accent" : "text-muted"
                  }`}
                >
                  URL
                </button>
                <button
                  onClick={() => setImageMode("upload")}
                  className={`px-2 py-1 ${
                    imageMode === "upload" ? "text-accent" : "text-muted"
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {imageMode === "url" ? (
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="mt-2 w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="mt-2 w-full text-sm text-ink file:mr-3 file:border file:border-line file:bg-surface2 file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase file:text-ink"
              />
            )}

            {uploading && (
              <p className="mt-2 text-xs text-muted">Uploading…</p>
            )}

            {imageUrl && (
              <div className="relative mt-3 h-32 w-32 overflow-hidden border border-line bg-surface2">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="128px" />
              </div>
            )}
          </div>

          {/* Variations */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block font-mono text-xs uppercase tracking-wide text-muted">
                Variations (optional)
              </label>
              <button
                onClick={() =>
                  setVariations((prev) => [...prev, { name: "", optionsText: "" }])
                }
                className="font-mono text-xs uppercase text-accent hover:underline"
              >
                + Add Group
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              e.g. "Size" with options "S, M, L" — separate options with commas.
            </p>

            {variations.map((v, i) => (
              <div key={i} className="mt-3 flex gap-2">
                <input
                  value={v.name}
                  onChange={(e) =>
                    setVariations((prev) =>
                      prev.map((g, gi) => (gi === i ? { ...g, name: e.target.value } : g))
                    )
                  }
                  placeholder="Group name (e.g. Size)"
                  className="w-32 border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
                />
                <input
                  value={v.optionsText}
                  onChange={(e) =>
                    setVariations((prev) =>
                      prev.map((g, gi) =>
                        gi === i ? { ...g, optionsText: e.target.value } : g
                      )
                    )
                  }
                  placeholder="Options, comma-separated"
                  className="flex-1 border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
                />
                <button
                  onClick={() => setVariations((prev) => prev.filter((_, gi) => gi !== i))}
                  className="px-2 font-mono text-xs text-muted hover:text-accent"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {product && (
            <label className="flex items-center gap-2 font-mono text-xs uppercase text-muted">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-accent"
              />
              Active (visible in shop)
            </label>
          )}

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            {product ? (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete Product"}
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-accent px-6 py-2 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : product ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
