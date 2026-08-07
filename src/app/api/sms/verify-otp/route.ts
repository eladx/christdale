import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();

  const record = await prisma.phoneVerification.findUnique({
    where: { userId: user.id },
  });

  if (!record || record.code !== code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
  }

  const phone = record.phone;
  await prisma.phoneVerification.delete({ where: { userId: user.id } });

  // The client applies this to Supabase user_metadata itself (same
  // pattern as the name field in Settings) — no service role key needed.
  return NextResponse.json({ ok: true, phone });
}
