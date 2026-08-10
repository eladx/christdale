import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const variantKey = searchParams.get("variantKey") ?? "";
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId, variantKey } });
  }

  return NextResponse.json({ ok: true });
}

// Sets quantity to an exact value (not increment) — used by the +/-
// stepper on the cart page. Deletes the line if quantity drops to 0.
export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, variantKey = "", quantity } = await request.json();
  if (!productId || typeof quantity !== "number") {
    return NextResponse.json({ error: "Missing productId or quantity" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId, variantKey } });
  } else {
    await prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId, variantKey },
      data: { quantity },
    });
  }

  return NextResponse.json({ ok: true });
}
