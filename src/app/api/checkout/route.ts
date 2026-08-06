import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

// PayMongo requires exactly one payment_method_types entry per session.
// "Maribank" isn't a PayMongo channel — it doesn't offer that bank
// directly, so it's mapped to "dob" (their generic online-banking
// channel, which lets the customer pick their bank on PayMongo's page).
// If Maribank isn't listed there, swap this mapping or drop the option.
const PAYMENT_METHOD_MAP: Record<string, string> = {
  GCash: "gcash",
  Maya: "paymaya",
  Maribank: "dob",
};

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentMethod, shippingInfo, productIds } = await request.json();
  const paymongoMethod = PAYMENT_METHOD_MAP[paymentMethod];
  if (!paymongoMethod) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if (!shippingInfo?.fullName || !shippingInfo?.address || !shippingInfo?.phone) {
    return NextResponse.json({ error: "Shipping details are required" }, { status: 400 });
  }
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "Select at least one item to check out" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Only the items the customer actually checked get ordered — anything
  // left unselected stays in the cart untouched.
  const selectedIds = new Set(productIds);
  const cartItems = cart.items.filter((i) => selectedIds.has(i.productId));

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Selected items are no longer in your cart" }, { status: 400 });
  }

  const totalAmount = cartItems.reduce(
    (sum, i) => sum + Number(i.product.price) * i.quantity,
    0
  );

  // Create the Order first (PENDING) so we have something to attach the
  // PayMongo session id to, and a record even if checkout is abandoned.
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      totalAmount,
      shippingInfo,
      items: {
        create: cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.product.price,
        })),
      },
    },
  });

  const origin = new URL(request.url).origin;

  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "PAYMONGO_SECRET_KEY is not set in .env" },
      { status: 500 }
    );
  }

  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description: `Christdale order ${order.id}`,
          line_items: cartItems.map((i) => ({
            currency: "PHP",
            amount: Math.round(Number(i.product.price) * 100), // centavos
            name: i.product.name,
            quantity: i.quantity,
          })),
          payment_method_types: [paymongoMethod],
          success_url: `${origin}/checkout/success?order=${order.id}`,
        },
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(
      { error: data?.errors?.[0]?.detail ?? "PayMongo request failed" },
      { status: 500 }
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentRef: data.data.id },
  });

  return NextResponse.json({
    checkoutUrl: data.data.attributes.checkout_url,
  });
}