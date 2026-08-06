import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order");
  if (!orderId) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "PAID") return NextResponse.json({ status: "PAID" });

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
  const paymentIntentStatus = data?.data?.attributes?.payment_intent?.attributes?.status;

  if (paymentIntentStatus === "succeeded") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    // Only remove the items that were part of THIS order — anything the
    // customer left unchecked at checkout should still be in their cart.
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) {
      const orderedProductIds = order.items.map((i) => i.productId);
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: { in: orderedProductIds } },
      });
    }

    return NextResponse.json({ status: "PAID" });
  }

  return NextResponse.json({ status: order.status });
}