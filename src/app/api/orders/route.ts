import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      image: i.product.imageUrl,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      selectedOptions: i.selectedOptions,
    })),
  }));

  return NextResponse.json({ orders: data });
}
