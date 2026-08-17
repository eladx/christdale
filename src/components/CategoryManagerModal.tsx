"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Category = { id: string; name: string; productCount: number };

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

export default function CategoryManagerModal({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const headers = await authHeader();
    const res = await fetch("/api/admin/categories", { headers });
    const result = await res.json();
    setCategories(result.categories ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newName.trim()) return;
    setCreating(true);
    const headers = await authHeader();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const result = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(result.error ?? "Failed to create category.");
      return;
    }
    setNewName("");
    load();
    onChanged();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    setError("");
    const headers = await authHeader();
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
      headers,
    });
    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Failed to delete category.");
      return;
    }
    load();
    onChanged();
  }

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto border border-line bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Categories</h2>
          <button
            onClick={onClose}
            className="font-mono text-sm text-muted hover:text-ink"
          >
            CLOSE
          </button>
        </div>

        <form onSubmit={handleCreate} className="mt-6 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className="flex-1 border border-line bg-surface2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-accent px-4 font-mono text-xs uppercase tracking-wide text-bg hover:opacity-90 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        <div className="mt-6 divide-y divide-line border border-line">
          {categories === null && (
            <p className="p-4 text-sm text-muted">Loading…</p>
          )}
          {categories?.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm text-ink">{c.name}</p>
                <p className="font-mono text-xs text-muted">
                  {c.productCount} product{c.productCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id, c.name)}
                className="font-mono text-xs uppercase tracking-wide text-muted hover:text-accent"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
