import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      stockCount: p.stockCount,
      isActive: p.isActive,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId,
      categoryName: p.category.name,
    })),
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
  });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, price, imageUrl, stockCount, categoryId } =
    await request.json();

  if (!name || !price || !imageUrl || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || name,
        price,
        imageUrl,
        images: [imageUrl],
        stockCount: stockCount ?? 0,
        categoryId,
      },
    });
    // Make the new product show up on the shop/home pages immediately,
    // instead of waiting for the 60s ISR window or the next deploy.
    revalidatePath("/products");
    revalidatePath("/");
    return NextResponse.json({ product });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A product with a similar name already exists (slug conflict)." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}