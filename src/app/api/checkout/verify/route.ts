import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

// Confirms payment by asking PayMongo directly, triggered when the
// customer lands back on our success page. This is the pragmatic
// approach for local dev — PayMongo's recommended production method is
// a webhook (checkout_session.payment.paid), which needs a public URL
// and isn't reachable from localhost. Add that before going live, since
// a customer closing the tab before this page loads would leave the
// order stuck at PENDING even though PayMongo shows it as paid.
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order");
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ status: "PAID" });
  }

  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey || !order.paymentRef) {
    return NextResponse.json({ status: order.status });
  }

  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  const res = await fetch(
    `https://api.paymongo.com/v1/checkout_sessions/${order.paymentRef}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const data = await res.json();

  const paymentIntentStatus =
    data?.data?.attributes?.payment_intent?.attributes?.status;

  if (paymentIntentStatus === "succeeded") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      select: { productId: true, quantity: true },
    });

    // Decrement stock for what was actually purchased. Uses a
    // transaction so partial failures don't leave stock half-updated.
    // Note: this doesn't lock rows, so two simultaneous purchases of
    // the last unit could still both succeed (a known limitation
    // without a proper reservation system) — fine for current volume,
    // worth revisiting before high-traffic launch.
    await prisma.$transaction(
      orderItems.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stockCount: { decrement: item.quantity } },
        })
      )
    );

    // Stock can't go negative even under the race condition above —
    // clamp anything that dipped below zero back to 0.
    await prisma.product.updateMany({
      where: { id: { in: orderItems.map((i) => i.productId) }, stockCount: { lt: 0 } },
      data: { stockCount: 0 },
    });

    const purchasedIds = orderItems.map((i) => i.productId);

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: { in: purchasedIds } },
      });
    }

    return NextResponse.json({ status: "PAID" });
  }

  return NextResponse.json({ status: order.status });
}
