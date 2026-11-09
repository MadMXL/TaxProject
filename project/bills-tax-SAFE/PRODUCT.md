# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Staff of a small Thai engineering-services contractor: electrical installation, steel welding, concrete work and machine maintenance, mostly for companies, with some private customers. Every user signs in, and the four roles do different jobs:

- **Sales** writes bills, invoices and tax invoices, keeps the customer and product lists, and opens jobs for customers. Mostly at a desk.
- **Technician** works on site. Checks and approves documents waiting for review, records job costs, and takes materials out of stock or puts them back. Often on a phone.
- **Manager** approves documents, watches revenue and stock, and adds Sales and Technician accounts.
- **Admin** (the owner) can do everything a manager can, plus edit company and tax details, read the activity log and restore archived records.

## Product Purpose

Baigamgab SmartLedger replaces paper and spreadsheet billing with one shared ledger. It covers documents from draft to approval, jobs and what they cost, supplier prices, materials on hand, and a monthly revenue summary for the owner. It succeeds when a document goes from draft to approved PDF without leaving the app, and when the owner knows the month's revenue and which materials are running low without asking anyone.

It is a university project (PSU) built for a real SME. The goal is a convincing, correct demo and report, not production deployment.

## Positioning

A bilingual (Thai and English) ledger built around this company's own workflow: Sales drafts, a Technician or Manager approves, then a Thai tax invoice with a QR code goes out. Each role sees only the pages for its job.

## Operating Context

- Document types: bill (ใบเสร็จ), invoice (ใบแจ้งหนี้), tax invoice (ใบกำกับภาษี). Flat 7% VAT, THB to two decimals.
- Status flow: draft → pending → approved | rejected. Rejected documents go back to Sales.
- Jobs (stored as `purchaseOrders`) go open → in progress → completed. A completed job becomes an invoice.
- Material prices are recorded per supplier to find the cheapest source.
- Stock is changed by hand: "Receive" adds, "Use" subtracts and can name a job. Each item has a minimum level. At or below it, the app shows a warning.
- The monthly revenue report is in the app. "Email this report" opens the user's own mail app with the summary filled in, and "Download PDF" saves it. There is no server-side or automatic email.
- PDFs use the Sarabun font so Thai renders. Documents carry a QR code that deep-links back to the app.

## Capabilities and Constraints

- Static PWA: vanilla JS, no framework, no build step. Firebase Realtime Database and Auth. jsPDF and qrcodejs from a CDN.
- Each list is written to Firebase as a whole array. Deletes are soft (archive and restore).
- Roles are enforced in the client. Database rules are the real enforcement and are deployed by hand.
- Accepted limitations, documented as future work: last-write-wins concurrency, client-side RBAC, Thai e-Tax compliance, automatic scheduled email.

## Brand Commitments

- Name: "Baigamgab SmartLedger". Legal name on documents: บริษัท ภูธการช่าง จำกัด (Phuket).
- Every label exists in both English and Thai. Thai is first-class, not a translation afterthought.

## Evidence on Hand

- Seed data in `js/data.js`: real-style Thai customers, services and documents from Mar–Sep 2026.
- No testimonials, metrics or customer quotes exist. Don't invent them.

## Product Principles

1. Each role sees only the pages for its job. A page that only makes sense for another role is hidden, not disabled.
2. Money is exact. Totals, VAT and revenue figures use the same rounding everywhere, and a PDF matches the screen.
3. Warn before it hurts. Low stock, rejected documents and pending approvals appear where the responsible role will see them, without being hunted for.
4. Thai and English are equal. A screen isn't done until both languages fit.
5. Nothing is silently lost. Deletes can be undone, archives can be restored, and the document form survives re-renders.

## Accessibility & Inclusion

Used on site from phones (technicians) as well as on desktops. Touch targets are 44px or larger on mobile. The app works in light and dark mode. Text must fit and wrap correctly in Thai, which runs longer than the English and uses stacked vowel marks.
