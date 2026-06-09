/**
 * Signed admin browser session — httpOnly cookie.
 * Do not expose ADMIN_PANEL_SECRET to the client; verification runs on the server only.
 */
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE_NAME = "gita_admin_sess";

export function signAdminCookie(): string {
  const secret = process.env.ADMIN_PANEL_SECRET;
  if (!secret) {
    throw new Error("ADMIN_PANEL_SECRET is not configured");
  }
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const sig = createHmac("sha256", secret).update(`${exp}:gita-admin`).digest("hex");
  return `${exp}|${sig}`;
}

export function verifyAdminCookie(raw: string | undefined): boolean {
  const secret = process.env.ADMIN_PANEL_SECRET;
  if (!secret || !raw) return false;
  const pipe = raw.indexOf("|");
  if (pipe < 0) return false;
  const expStr = raw.slice(0, pipe);
  const sig = raw.slice(pipe + 1);
  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", secret).update(`${exp}:gita-admin`).digest("hex");
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}
