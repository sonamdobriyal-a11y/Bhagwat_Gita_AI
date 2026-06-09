export const runtime = "nodejs";

import { adminJsonUnauthorized, verifyAdminFromCookies } from "@/app/api/admin/_guards";
import { listAuthUsersSafeCap } from "@/lib/firebase-admin";

export async function GET() {
  if (!verifyAdminFromCookies()) {
    return adminJsonUnauthorized();
  }

  try {
    const users = await listAuthUsersSafeCap(2000);
    return Response.json({ users, count: users.length });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to load users.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
