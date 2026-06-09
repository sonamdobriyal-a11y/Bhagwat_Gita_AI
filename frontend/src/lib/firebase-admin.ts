/**
 * Firebase Admin SDK — server-only (API routes). Lists Auth users & reads Firestore.
 */
import * as admin from "firebase-admin";

/** Lazily initialise; avoids crashing Next build when env vars are absent. */
export function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is missing. Firebase Console → Project settings → Service accounts → Generate new private key.",
    );
  }
  const credentials = JSON.parse(raw) as admin.ServiceAccount;
  return admin.initializeApp({ credential: admin.credential.cert(credentials) });
}

export type AdminAuthUserRow = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  disabled: boolean;
  providers: string[];
  createdAt: string | null;
  lastSignInAt: string | null;
};

export async function listAuthUsersSafeCap(maxRows = 2000): Promise<AdminAuthUserRow[]> {
  const auth = getFirebaseAdminApp().auth();
  const rows: AdminAuthUserRow[] = [];
  let pageToken: string | undefined;

  while (rows.length < maxRows) {
    const res = await auth.listUsers(1000, pageToken);
    for (const u of res.users) {
      rows.push({
        uid: u.uid,
        email: u.email ?? null,
        displayName: u.displayName ?? null,
        photoURL: u.photoURL ?? null,
        disabled: u.disabled,
        providers: u.providerData?.map((p) => p.providerId) ?? [],
        createdAt: u.metadata.creationTime ? new Date(u.metadata.creationTime).toISOString() : null,
        lastSignInAt: u.metadata.lastSignInTime
          ? new Date(u.metadata.lastSignInTime).toISOString()
          : null,
      });
      if (rows.length >= maxRows) break;
    }
    if (!res.pageToken || rows.length >= maxRows) break;
    pageToken = res.pageToken;
  }

  return rows;
}

export type AdminFeedbackRow = {
  id: string;
  username: string;
  age: number;
  gender: string;
  email: string;
  location: string;
  feedback: string;
  createdAt: string | null;
};

/** Reads `feedback` collection (same path as client writes). */
export async function listFeedback(limit = 200): Promise<AdminFeedbackRow[]> {
  const db = getFirebaseAdminApp().firestore();

  async function mapSnap(snap: admin.firestore.QuerySnapshot): Promise<AdminFeedbackRow[]> {
    const out: AdminFeedbackRow[] = [];
    snap.docs.forEach((doc) => {
      const data = doc.data();
      let createdAt: string | null = null;
      const ca = data.createdAt;
      if (ca?.toDate) {
        createdAt = ca.toDate().toISOString();
      }
      out.push({
        id: doc.id,
        username: String(data.username ?? ""),
        age: typeof data.age === "number" ? data.age : Number(data.age) || 0,
        gender: String(data.gender ?? ""),
        email: String(data.email ?? ""),
        location: String(data.location ?? ""),
        feedback: String(data.feedback ?? ""),
        createdAt,
      });
    });
    return out;
  }

  try {
    const snap = await db.collection("feedback").orderBy("createdAt", "desc").limit(limit).get();
    return mapSnap(snap);
  } catch (e) {
    console.warn("Admin listFeedback orderBy fallback:", e);
    const snap = await db.collection("feedback").limit(limit).get();
    return mapSnap(snap);
  }
}
