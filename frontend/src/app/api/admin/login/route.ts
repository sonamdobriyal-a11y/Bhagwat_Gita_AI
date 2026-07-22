import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, signAdminCookie } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PANEL_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PANEL_SECRET is not set on the server." },
      { status: 503 },
    );
  }

  let body: { secret?: string };
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const secret = body.secret?.trim();
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const token = signAdminCookie();
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  res.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
