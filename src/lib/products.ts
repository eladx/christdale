import { prisma } from "./prisma";

export type ProductVariationGroup = {
  name: string;
  options: string[];
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  inStock: boolean;
  description: string;
  image: string;
  images: string[];
  variations: ProductVariationGroup[];
};

function toProduct(r: {
  id: string;
  name: string;
  slug: string;
  category: { name: string };
  price: unknown;
  stockCount: number;
  description: string;
  imageUrl: string;
  images: string[];
  variations: { name: string; options: string[] }[];
}): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category.name,
    price: Number(r.price),
    inStock: r.stockCount > 0,
    description: r.description,
    image: r.imageUrl,
    images: r.images.length > 0 ? r.images : [r.imageUrl],
    variations: r.variations,
  };
}

export async function getProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, variations: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(toProduct);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const r = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variations: true },
  });
  if (!r) return null;
  return toProduct(r);
}

export async function getCategories(): Promise<string[]> {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => c.name);
}
