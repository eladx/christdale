import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";
import { sendSms } from "@/lib/sms";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone } = await request.json();
  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.phoneVerification.upsert({
    where: { userId: user.id },
    update: { phone, code, expiresAt },
    create: { userId: user.id, phone, code, expiresAt },
  });

  await sendSms(phone, `Your Christdale verification code is ${code}. Expires in 5 minutes.`);

  return NextResponse.json({ ok: true });
}
