import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymongoSignature } from "@/lib/paymongo-webhook";
import { fulfillOrder } from "@/lib/order-fulfillment";

export async function POST(request: Request) {
  // Raw text, not request.json() — signature verification needs the
  // exact bytes PayMongo signed. Parsing first would break the HMAC check.
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("paymongo-signature");
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("PAYMONGO_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  if (!verifyPaymongoSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event?.data?.attributes?.type;
  console.log("[PayMongo webhook] received event type:", eventType);
  console.log(
    "[PayMongo webhook] nested data:",
    JSON.stringify(event?.data?.attributes?.data, null, 2)
  );

  // Always acknowledge with 200 once the signature is valid, even for
  // event types we don't act on — PayMongo disables webhooks that
  // consistently fail to return 2xx, and retries otherwise.
  try {
    if (eventType === "checkout_session.payment.paid") {
      const checkoutSessionId = event.data.attributes.data?.id;
      console.log(
        "[PayMongo webhook] looking for order with paymentRef:",
        checkoutSessionId
      );
      if (checkoutSessionId) {
        const order = await prisma.order.findFirst({
          where: { paymentRef: checkoutSessionId },
        });
        console.log(
          "[PayMongo webhook] matched order:",
          order?.id ?? "NONE FOUND"
        );
        if (order) {
          await fulfillOrder(order.id);
          console.log("[PayMongo webhook] fulfillOrder completed for", order.id);
        }
      }
    }
  } catch (err) {
    // Log and still return 200 — we don't want PayMongo endlessly
    // retrying (and potentially disabling the endpoint) over a bug on
    // our side; failures here need to be caught by monitoring/logs.
    console.error("Error processing PayMongo webhook:", err);
  }

  return NextResponse.json({ received: true });
}
