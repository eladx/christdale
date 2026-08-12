import { prisma } from "@/lib/prisma";

// Marks an order PAID, decrements stock for what was purchased, and
// clears those items from the customer's cart. Safe to call more than
// once for the same order — the atomic updateMany below ensures the
// stock/cart side-effects only run once, even if both the webhook and
// the success-page verification fire for the same order (which can
// happen, since either one might arrive first).
export async function fulfillOrder(orderId: string) {
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: { not: "PAID" } },
    data: { status: "PAID" },
  });

  if (claimed.count === 0) {
    // Already PAID (or order doesn't exist) — nothing more to do.
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true },
  });

  await prisma.$transaction(
    orderItems.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stockCount: { decrement: item.quantity } },
      })
    )
  );

  // Stock can't go negative even under a race condition — clamp back to 0.
  await prisma.product.updateMany({
    where: {
      id: { in: orderItems.map((i) => i.productId) },
      stockCount: { lt: 0 },
    },
    data: { stockCount: 0 },
  });

  const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: { in: orderItems.map((i) => i.productId) } },
    });
  }
}
