import { getProducts, getCategories } from "@/lib/products";
import ProductsFilter from "@/components/ProductsFilter";

// Without this, Next statically renders this page once at deploy time and
// serves that snapshot forever — new products and stock changes from the
// admin panel wouldn't show up until the next deploy.
export const revalidate = 60;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="wrap py-16">
      <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
        Shop
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Equipment
      </h1>

      <ProductsFilter products={products} categories={categories} />
    </div>
  );
}