import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminCookie } from "@/lib/admin-session";

export function adminJsonUnauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/** Returns true when the signed admin httpOnly cookie is valid. */
export function verifyAdminFromCookies(): boolean {
  const raw = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminCookie(raw);
}
