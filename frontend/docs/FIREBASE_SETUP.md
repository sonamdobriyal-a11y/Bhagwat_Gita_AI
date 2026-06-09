# Firebase setup (authentication + feedback)

This app uses **Firebase Authentication (Google)** for sign-in so you can see registered users in the console, and **Cloud Firestore** for the feedback form.

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**.

## 2. Enable Authentication (Google)

1. **Build** → **Authentication** → **Get started**.
2. **Sign-in method** tab → **Google** → **Enable**.
3. Pick a support email and save.  
   Firebase attaches the required OAuth client automatically to your project.

**Where to see users**

- **Build** → **Authentication** → **Users** — lists every account that has signed in via Google (identifier, provider, created, last sign-in).

**Authorized domains**

- **Authentication** → **Settings** → **Authorized domains** — ensure **`localhost`** appears for local dev; add your production domain when you deploy.

## 3. Register a web app

1. Project **Settings** (gear) → **Your apps** → **Web** (`</>`).
2. Copy the config values into `frontend/.env.local` as the `NEXT_PUBLIC_FIREBASE_*` variables (see `.env.example`).
3. Restart `npm run dev` after changing env.

> You no longer need NextAuth or `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in the frontend for login; Google sign-in is handled entirely by Firebase Auth.

## 4. Firestore (feedback form only)

1. **Build** → **Firestore Database** → **Create database** if you have not already.

## 5. Firestore security rules


By default a new database starts with **everything denied**. If you see **“Missing or insufficient permissions.”** after submitting the form, rules are blocking the write—you must paste and **Publish** updated rules below.

Use rules that validate each field (**no** brittle `keys().hasAll`—and allow `int` **or** `float` for `age`, since some clients serialize numbers oddly):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /feedback/{docId} {
      allow create: if request.resource.data.username is string
        && request.resource.data.username.size() > 0
        && request.resource.data.username.size() <= 200
        && (
          request.resource.data.age is int
          || request.resource.data.age is float
        )
        && request.resource.data.age >= 13
        && request.resource.data.age <= 120
        && request.resource.data.gender is string
        && request.resource.data.gender.size() > 0
        && request.resource.data.email is string
        && request.resource.data.email.size() <= 320
        && request.resource.data.location is string
        && request.resource.data.location.size() > 0
        && request.resource.data.location.size() <= 500
        && request.resource.data.feedback is string
        && request.resource.data.feedback.size() >= 10
        && request.resource.data.feedback.size() <= 12000;

      allow read, update, delete: if false;
    }
  }
}
```

Important:

- **`createdAt`** is optional in these rules—you do not validate it here; Firebase still stores it even when your rule only mentions the fields above.

Then open **Firestore** → **Rules** → paste → **Publish** (not Save only if you navigated away before publishing).

### If it still fails

1. Confirm **Firestore Database** exists in **this same project** whose `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is in `.env.local`.
2. Make sure rules are published for **`(default)`** database—not only for a named database you are not using.
3. Temporary **dev-only** permissive rule (remove before production):

```
match /feedback/{docId} {
  allow create: if request.time != null;
}
```

Publish, test the form once, then replace with the stricter rules above.

## 6. Restrict API key (recommended)

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**, restrict the browser key by **HTTP referrers** to your deployed domain and `http://localhost:3000` for development.

## 7. Admin panel (Firebase users + feedback)

There is an internal dashboard at **`/admin`** that lists:

- **Users** — accounts from Firebase Authentication (via Firebase Admin SDK; not exposed to the browser SDK alone).
- **Feedback** — documents in the **`feedback`** Firestore collection (newest first when `createdAt` exists).

The page sets **no-index** headers and uses a separate server secret (not your Google OAuth client).

### Env vars (`frontend/.env.local`)

Add these alongside your `NEXT_PUBLIC_FIREBASE_*` values (restart `npm run dev` after edits):

| Variable | Purpose |
|----------|---------|
| `ADMIN_PANEL_SECRET` | Long random string. You paste the same value in the admin sign-in form; the server sets an **httpOnly** session cookie signed with this secret. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Full** service account key JSON as **one line** (never `NEXT_PUBLIC_*`). Firebase Console → **Project settings** → **Service accounts** → **Generate new private key**. Minify the JSON (remove line breaks) so `.env` parses correctly. |

### Security notes

- Treat `ADMIN_PANEL_SECRET` like a password; rotate it if leaked.
- Never commit `.env.local` or the service account file. The service account JSON grants **project admin** capabilities—store it only on the server.
- Do not add a public nav link to `/admin` unless you intentionally want it discoverable.
- For production, prefer **short-lived** access (IP allowlist, VPN, or a proper admin role in your auth system) in addition to this secret.

### Dependencies

The frontend uses the **`firebase-admin`** package in **Node** API routes only (`runtime = "nodejs"`). If `listUsers` or Firestore reads fail, confirm the service account JSON matches the same Firebase project as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
