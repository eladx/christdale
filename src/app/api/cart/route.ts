import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  const items = (cart?.items ?? []).map((i) => ({
    productId: i.productId,
    name: i.product.name,
    price: Number(i.product.price),
    image: i.product.imageUrl,
    quantity: i.quantity,
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await request.json();
  if (!productId || !quantity) {
    return NextResponse.json({ error: "Missing productId or quantity" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product is not available" }, { status: 400 });
  }
  if (product.stockCount <= 0) {
    return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  // Cap the cart quantity at whatever's actually in stock, whether this
  // is a fresh add or topping up an item already in the cart.
  const requestedTotal = (existing?.quantity ?? 0) + quantity;
  const cappedQuantity = Math.min(requestedTotal, product.stockCount);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: cappedQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: cappedQuantity },
    });
  }

  return NextResponse.json({ ok: true });
}