import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.stockCount === "number") data.stockCount = body.stockCount;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.price === "number") data.price = body.price;
  if (typeof body.imageUrl === "string") {
    data.imageUrl = body.imageUrl;
    data.images = [body.imageUrl];
  }
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId;

  // Variations are edited as a whole list in the admin UI — simplest
  // correct approach is replace-all rather than diffing individual rows.
  if (Array.isArray(body.variations)) {
    await prisma.$transaction([
      prisma.productVariation.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...data,
          variations: {
            create: body.variations.map((v: { name: string; options: string[] }) => ({
              name: v.name,
              options: v.options,
            })),
          },
        },
      }),
    ]);
  } else {
    await prisma.product.update({ where: { id }, data });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Can't delete — this product has order history. Set it to inactive instead.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
