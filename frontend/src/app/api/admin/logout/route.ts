import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST() {
  cookies().delete(ADMIN_SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
