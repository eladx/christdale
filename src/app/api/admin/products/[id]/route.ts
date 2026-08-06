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
  if (typeof body.stockCount === "number") data.stockCount = body.stockCount;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.price === "number") data.price = body.price;

  await prisma.product.update({ where: { id }, data });

  return NextResponse.json({ ok: true });
}
