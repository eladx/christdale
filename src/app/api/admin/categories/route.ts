import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      productCount: c._count.products,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const category = await prisma.category.create({
      data: { name: name.trim(), slug },
    });
    return NextResponse.json({ category });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A category with that name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}