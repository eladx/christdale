import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Best-effort customer email lookup. Requires SUPABASE_SERVICE_ROLE_KEY
  // (Project Settings > API Keys > service_role — server-only, never
  // expose this to the browser). Falls back to showing the raw user id
  // if that key isn't set.
  let emailByUserId: Record<string, string> = {};
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
    const uniqueUserIds = Array.from(new Set(orders.map((o) => o.userId)));
    await Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          const { data } = await admin.auth.admin.getUserById(id);
          if (data.user?.email) emailByUserId[id] = data.user.email;
        } catch {
          // ignore — falls back to raw id below
        }
      })
    );
  }

  const data = orders.map((o) => ({
    id: o.id,
    userId: o.userId,
    customerEmail: emailByUserId[o.userId] ?? null,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    shippingInfo: o.shippingInfo,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
  }));

  return NextResponse.json({ orders: data });
}
