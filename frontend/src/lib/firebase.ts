import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseAuthSignOut,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let authInstance: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase environment variables are not set.");
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export async function firebaseSignInWithGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(auth, provider);
}

export async function firebaseSignOut(): Promise<void> {
  await firebaseAuthSignOut(getFirebaseAuth());
}

export type AuthSessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export function mapFirebaseUserToSessionUser(user: User | null): AuthSessionUser | null {
  if (!user) return null;
  return {
    id: user.uid,
    name: user.displayName,
    email: user.email,
    image: user.photoURL,
  };
}

/** Subscribe on the client; returns unsubscribe */
export function subscribeAuthState(listener: (user: AuthSessionUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (u) => {
    listener(mapFirebaseUserToSessionUser(u));
  });
}
