import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  if (typeof body.stockCount === "number") data.stockCount = body.stockCount;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.price === "number") data.price = body.price;
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.imageUrl === "string" && body.imageUrl.trim()) {
    data.imageUrl = body.imageUrl.trim();
    data.images = [body.imageUrl.trim()];
  }
  if (typeof body.categoryId === "string" && body.categoryId) data.categoryId = body.categoryId;

  await prisma.product.update({ where: { id }, data });

  // Same reasoning as create: a stock/price/active edit should be visible
  // on the shop immediately, not after the ISR window or next deploy.
  revalidatePath("/products");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}