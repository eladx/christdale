import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCoaches } from "@/lib/coaches";
import ProductCard from "@/components/ProductCard";
import CoachCard from "@/components/CoachCard";

// Same reason as /products: without this the featured products on the
// homepage freeze at whatever they were on the last Vercel deploy.
export const revalidate = 60;

export default async function Home() {
  const [products, coaches] = await Promise.all([
    getProducts(),
    getCoaches(),
  ]);
  const featured = products.slice(0, 3);
  const coach = coaches[0];

  return (
    <>
      {/* Hero: the thesis is "the bar doesn't care about your excuses" —
          equipment + coaching framed as the two things standing between
          you and the next rep. */}
      <section className="wrap pb-20 pt-16 md:pt-24">
        <p className="font-mono text-xs uppercase tracking-widest2 text-accent">
          Bodyweight Training Co.
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.05] text-ink md:text-7xl 2xl:text-8xl">
          THE BAR DOESN&apos;T CARE
          <br />
          ABOUT YOUR{" "}
          <span className="chalk-mark text-accent">EXCUSES.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          Rings, bars, and parallettes built to hold up under real training —
          plus coaches who&apos;ll tell you the truth about your form.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="bg-accent px-6 py-3 font-mono text-sm uppercase tracking-wide text-bg transition-opacity hover:opacity-90"
          >
            Shop Equipment
          </Link>
          <Link
            href="/coaches"
            className="border border-line px-6 py-3 font-mono text-sm uppercase tracking-wide text-ink transition-colors hover:border-accentSoft hover:text-accentSoft"
          >
            Find a Coach
          </Link>
        </div>
      </section>

      <div className="wrap">
        <div className="plate-divider">
          <span className="plate-dot" />
          <span className="plate-dot" />
          <span className="plate-dot" />
        </div>
      </div>

      {/* Coaching preview */}
      <section className="wrap py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
              Coaching
            </p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              Programming that meets you at your first pull-up
            </h2>
            <p className="mt-4 text-muted">
              No generic templates. Every coaching request gets reviewed and
              matched to your current level — whether that&apos;s your first
              dead hang or your first muscle-up.
            </p>
            <Link
              href="/coaches"
              className="mt-6 inline-block font-mono text-sm uppercase tracking-wide text-accent hover:underline"
            >
              Meet the Coaches →
            </Link>
          </div>
          <CoachCard coach={coach} />
        </div>
      </section>

      <div className="wrap">
        <div className="plate-divider">
          <span className="plate-dot" />
          <span className="plate-dot" />
          <span className="plate-dot" />
        </div>
      </div>

      {/* Shop preview */}
      <section className="wrap py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest2 text-accentSoft">
              Shop
            </p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              Equipment that earns its shelf space
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden font-mono text-sm uppercase tracking-wide text-accent hover:underline md:block"
          >
            View All →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}