# Security notes

## Is the Firebase API key in this repo a leak?

**No.** The `apiKey` (and `authDomain`, `projectId`, `databaseURL`, `appId`, …) in
[`js/firebase-config.js`](js/firebase-config.js) and [`login.html`](login.html) is a
Firebase **web** config. It is a public project identifier, not a credential — it does
not grant access to any data on its own. Google's documentation says it is fine to
include it in client code and commit it to a public repo.

This app is a static site (GitHub Pages). The config **must** be delivered to every
visitor's browser to work, so it can never be truly hidden — anyone can read it from
DevTools on the live site. Removing it from git, or rotating it, buys almost nothing.

GitHub's secret scanner flags the `AIzaSy…` string pattern regardless. For a Firebase
web key that alert is expected and low-severity. If push protection blocks a push, you
can allow it (documenting it as a Firebase web key) — but first do the three steps below,
which are what actually protect the project.

## What actually protects the project

### 1. Realtime Database rules  — the important one

If the database is in **test mode** (`".read": true, ".write": true`), anyone who reads
`databaseURL` from this repo can read, overwrite, or wipe the entire database. No key or
login required.

Fix: Firebase Console → **Realtime Database → Rules** → paste
[`database.rules.json`](database.rules.json) → **Publish**.

Those rules:
- require a signed-in user (`auth != null`) for every path
- let only `admin` / `manager` write under `users/`
- stop any user from changing their own `role` (only an admin/manager session can
  write a `users/$uid` node, and `role` is validated against the four allowed values)

Bootstrapping: create the first `admin` user's `users/<uid>` node by hand in the
Console (Data tab) — with these rules, nobody can create the first admin from the app.

### 2. Restrict the API key

Google Cloud Console → **APIs & Services → Credentials** → the browser key:

- **Application restrictions → HTTP referrers**, add:
  ```
  localhost:*
  127.0.0.1:*
  <your-github-username>.github.io/*
  ```
- **API restrictions → Restrict key** → allow only what a Firebase web app needs
  (Identity Toolkit API / Token Service API; plus Firebase Realtime Database if listed).

Now the key only works from your own pages, and only for Firebase auth — even if
someone copies it out of the repo it is useless to them.

### 3. Trim authorized domains

Firebase Console → **Authentication → Settings → Authorized domains** — keep only:

```
localhost
<your-github-username>.github.io
<project>.firebaseapp.com
```

### 4. (Optional, stronger) App Check

Enable **App Check** with reCAPTCHA v3 and enforce it on Realtime Database. This
attests that requests come from your real app, not a copied config.

## Closing the GitHub "Google API Key" alert

GitHub's remediation steps (rotate / revoke / check breach logs) are written for a
*server-side* Google Cloud key that can call billable APIs. They do not really apply to
a Firebase web key. Once steps 1–3 above are done:

- **Dismiss the alert** — Security → Secret scanning alerts → this alert →
  **Close as** → *"Won't fix"* (or *"Used in tests"*). A restricted Firebase web key is
  not a credential; this is the correct disposition.
- Deleting the key from the current files does **not** clear the alert on its own —
  secret scanning also reads git history, where the string still exists. Clearing it
  fully means rotating the key and rewriting history (`git filter-repo`, then force-push),
  which is disruptive and, for a restricted web key, not worth it.

## If you rotate the key anyway

You can regenerate the browser key in Cloud Console → Credentials. Update it in
`js/firebase-config.js` and `login.html`. This only matters if the *old* key was
unrestricted and being abused — restricting it (step 2) is the better fix.
