"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsFilter({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = p.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      const matchesStock = !inStockOnly || p.inStock;
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [products, query, category, inStockOnly]);

  return (
    <div className="mt-10 flex flex-col gap-8 md:flex-row">
      <aside className="w-full shrink-0 md:w-56">
        <label className="block font-mono text-xs uppercase tracking-wide text-muted">
          Search
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="mt-2 w-full border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />

        <label className="mt-6 block font-mono text-xs uppercase tracking-wide text-muted">
          Category
        </label>
        <div className="mt-2 flex flex-col gap-1">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-left font-mono text-sm uppercase tracking-wide transition-colors ${
                category === c ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-muted">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-accent"
          />
          In Stock Only
        </label>
      </aside>

      <div className="flex-1">
        {filtered.length === 0 ? (
          <p className="text-muted">
            Nothing matches that search yet — try a different term or clear
            a filter.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
