# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Baigamgab **SmartLedger** — a billing / tax-invoice PWA for a Thai SME (university project). All app code lives in `project/bills-tax-SAFE/`. It is a static site: vanilla JS, no framework, no bundler, no package.json, no linter, no automated tests. Firebase Realtime Database + Auth (compat SDK 9.22 from gstatic), jsPDF + qrcodejs from cdnjs. UI is bilingual (English / Thai).

## Running

Serve `project/bills-tax-SAFE/` as the web root (the service worker registers at `/service-worker.js` and the manifest uses `/` paths, so a sub-path won't work), then open `login.html`:

```bash
cd project/bills-tax-SAFE && python -m http.server 8000
# http://localhost:8000/login.html
```

VS Code Live Server or `npx serve` also work. Login requires a real Firebase Auth account; the role comes from `users/{uid}/role` in the database.

Verification is manual in the browser (test checklists are in `WORKFLOW-GUIDE.md`). The service worker is network-first for same-origin files, but **bump `CACHE_NAME` in `service-worker.js`** when adding or renaming cached files.

## Architecture

**Global-script app.** `index.html` loads plain `<script>` tags in a fixed order — `data.js` → `firebase-config.js` → `functions.js` → `ui.js` → `app.js` — and every file shares one global scope. There are no modules/imports; functions are called from inline `onclick="..."` attributes in generated HTML, so renaming a function means grepping the template strings too.

- `js/data.js` — seed data and all mutable global state (`quotations`, `purchaseOrders`, `poCosts`, `materialPrices`, `customers`, `products`, `companyInfo`, plus view/filter state like `currentView`, `listFilters`).
- `js/firebase-config.js` — Firebase init, `showNotification()` (the "island" toast), and sync: `SYNCED_ARRAYS`, `loadFromFirebase()`, `setupRealtimeSync()`.
- `js/functions.js` — actions/business logic: document form, approval workflow, soft delete/archive, customers, products, POs and costs, PDF generation (`generatePDF`).
- `js/ui.js` — rendering. `renderApp()` rebuilds the whole `#app` via `innerHTML` template strings; `renderContent()` switches on `currentView`. Also `LANG` (en/th strings, read via `L(key)`), helpers `esc()` (HTML escaping — use it for all user data in templates), `fmt()`, `baht()`, icons.
- `js/app.js` — bootstrap on `DOMContentLoaded` (localStorage → Firebase → render → realtime listeners), localStorage persistence, `?doc=` QR deep-link handler.
- `login.html` — has its own inline copy of the Firebase config; signs in and writes `userId/userEmail/userRole/userName` to `sessionStorage`. `index.html` redirects back to login if they're missing. `admin.html` is just a redirect (admin tools are now in-app).

**Data flow.** Each list is a JS array that is written whole: mutate the array → persist to localStorage → `database.ref('<list>').set(array)`. Realtime `on('value')` listeners replace the arrays and call `debouncedRender()`, which skips re-rendering while `currentView === 'new'` so typing isn't lost. `renderApp()` also snapshots/restores the document form (`captureDocForm` / `fillDocForm`). When adding a new list, wire it into `SYNCED_ARRAYS`, `DATA_LISTS` (functions.js), `ARCHIVE_LISTS`, localStorage save/load, and `database.rules.json`.

**Soft delete.** Nothing is erased: `removeWithUndo()` moves records to `archive/<list>/<id>` with `inactiveAt/inactiveBy/inactiveReason` (`deleted` | `archived`); the Admin → Archive tab restores them. The archive is fetched only on demand.

**Roles** (`admin`, `manager`, `sales`, `technician`) are read from `sessionStorage.userRole` and gate UI in `renderApp()` and individual views. This is client-side only; the real enforcement is `database.rules.json`, which must be deployed manually in the Firebase Console (see `SECURITY.md`).

**Documents** (`quotations` node) have `docType` `bill` | `invoice` | `tax-invoice` and status flow `draft → pending → approved | rejected`. VAT is a flat 7% (`tax = round2(subtotal × 0.07)` when `vat`); money is THB to 2 decimals; `date` is local `YYYY-MM-DD`, `…At` is ISO UTC, `…By` is the user's email. Full schema: `DATA-DICTIONARY.md` — keep it in sync with any field change.

## Notes

- The Firebase web `apiKey` in `firebase-config.js` / `login.html` is intentionally public (see `SECURITY.md`); don't treat it as a leaked secret.
- Known limitations (whole-array writes / concurrency, client-side RBAC, tax-compliance details) are accepted as future work for this project — document them, don't refactor them unprompted.
- Changing `companyInfo` defaults requires bumping `companyInfo._seed`, otherwise stored copies in localStorage/Firebase override the new defaults.
