export const runtime = "nodejs";

import { verifyAdminFromCookies } from "@/app/api/admin/_guards";

function svcJsonOk(): boolean {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return false;
  try {
    const j = JSON.parse(raw) as { project_id?: string };
    return Boolean(j?.project_id);
  } catch {
    return false;
  }
}

export async function GET() {
  const hasSecret = Boolean(process.env.ADMIN_PANEL_SECRET);
  const hasServiceAccountJson = svcJsonOk();

  let authOk = false;
  try {
    authOk = verifyAdminFromCookies();
  } catch {
    authOk = false;
  }

  return Response.json({
    authenticated: authOk,
    adminSecretConfigured: hasSecret,
    serviceAccountConfigured: hasServiceAccountJson,
  });
}
