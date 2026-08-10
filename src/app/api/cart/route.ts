import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";
import { computeVariantKey } from "@/lib/variant";

function serializeCart(cart: {
  items: {
    productId: string;
    quantity: number;
    selectedOptions: unknown;
    variantKey: string;
    product: { name: string; imageUrl: string; price: unknown };
  }[];
}) {
  return cart.items.map((i) => ({
    productId: i.productId,
    variantKey: i.variantKey,
    selectedOptions: i.selectedOptions,
    name: i.product.name,
    price: Number(i.product.price),
    image: i.product.imageUrl,
    quantity: i.quantity,
  }));
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ items: cart ? serializeCart(cart) : [] });
}

// Increments quantity for the given product + variant, creating the
// cart line if it doesn't exist yet. Returns the full updated cart so
// the client doesn't need a second round trip to stay in sync.
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity, selectedOptions } = await request.json();
  if (!productId || !quantity) {
    return NextResponse.json({ error: "Missing productId or quantity" }, { status: 400 });
  }

  const variantKey = computeVariantKey(selectedOptions);

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId_variantKey: { cartId: cart.id, productId, variantKey } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, selectedOptions, variantKey },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ items: updated ? serializeCart(updated) : [] });
}
