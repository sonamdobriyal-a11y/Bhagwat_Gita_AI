export const runtime = "nodejs";

import { adminJsonUnauthorized, verifyAdminFromCookies } from "@/app/api/admin/_guards";
import { listFeedback } from "@/lib/firebase-admin";

export async function GET() {
  if (!verifyAdminFromCookies()) {
    return adminJsonUnauthorized();
  }

  try {
    const feedback = await listFeedback(250);
    return Response.json({ feedback, count: feedback.length });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to load feedback.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
