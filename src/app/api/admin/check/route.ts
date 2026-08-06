import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  return NextResponse.json({ isAdmin: isAdminEmail(user?.email) });
}
