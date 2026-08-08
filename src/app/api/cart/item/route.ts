import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

// Bulk sibling of /api/cart/item (singular) — deletes several cart items
// in one call, used by the cart page's "Delete Selected" action so
// removing 5 checked items is one request instead of 5.
export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productIds } = await request.json();
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "Missing productIds" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: { in: productIds } },
    });
  }

  return NextResponse.json({ ok: true });
}