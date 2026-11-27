# Data Dictionary — Baigamgab SmartLedger

Every node stored in the Firebase Realtime Database (`baigumgub-default-rtdb`, region asia-southeast1).
Live nodes are also cached in the browser's `localStorage` under the same key so the app works offline.

**Conventions**

| Item | Rule |
|---|---|
| Dates | `date` fields are `YYYY-MM-DD` strings in local time, so they sort and compare as text (`"2026-09-01" < "2026-09-30"`). |
| Timestamps | `…At` fields are ISO-8601 UTC strings, e.g. `2026-09-13T02:15:00.000Z`. |
| Users | `…By` fields hold the signed-in user's email. |
| Money | Thai baht (THB), rounded to 2 decimals. VAT is a flat 7% (`tax = round2(subtotal × 0.07)`). |
| Required | **Y** = always present. **N** = optional or only set at a certain stage. |

## Node overview

| Node | Shape | Holds | Loaded at start-up |
|---|---|---|---|
| `quotations` | array | Quotations, bills, invoices and tax invoices (all "documents") | Yes |
| `purchaseOrders` | array | Purchase orders before they become invoices | Yes |
| `poCosts` | array | Cost lines recorded against a purchase order | Yes |
| `materialPrices` | array | Price per unit per supplier, for comparison | Yes |
| `customers` | array | Customer master data | Yes |
| `products` | array | Product / service catalogue | Yes |
| `stockItems` | array | Materials kept on hand, with safety stock levels | Yes |
| `stockMoves` | array | Every stock change (receive / use / count) | Yes |
| `purchaseRequests` | array | Requests to buy stock, their approval and delivery | Yes |
| `companyInfo` | object | Seller details printed on every document | Yes |
| `users/{uid}` | object per user | Name, email and role of each account | Admin pages only |
| `userPhotos/{uid}` | string per user | Profile photo | Own photo only; the Team page loads all |
| `stockImages/{itemId}` | string per item | Picture of a stock item | Yes, except Sales |
| `archive/{list}/{id}` | object keyed by record ID | Soft-deleted and archived records | **No**, only on demand |

---

## 1. `quotations` — documents

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `DOC-2026-0913` | Primary key. `DOC-YYYY-NNNN`; documents converted from a PO use `QTYYYYMMDDNNN`. |
| `date` | string (date) | Y | `2026-09-15` | Document date. Used by the date-range filter, grouping and archiving. |
| `docType` | enum | Y | `tax-invoice` | `quotation` \| `bill` \| `invoice` \| `tax-invoice`. A quotation is a price offer: never counted as revenue and never owed. |
| `customer` | string | Y | `บริษัท ศิริวัฒน์ก่อสร้าง จำกัด` | Customer name (copied, not a foreign key). Used by the customer filter. |
| `customerEmail` | string | N | `contact@siriwat.co.th` | |
| `customerAddress` | string | N | | |
| `taxId` | string | N | `0-1055-48012-34-5` | 13-digit Thai tax ID. Required in the form when `docType = tax-invoice`. |
| `items` | array of Item | Y | | At least 1 line; see 1a. |
| `subtotal` | number | Y | `45000` | Σ qty × price. |
| `vat` | boolean | N | `true` | Whether 7% VAT is charged. Older records may lack it. |
| `tax` | number | Y | `3150` | `round2(subtotal × 0.07)` when `vat`, else 0. |
| `total` | number | Y | `48150` | `subtotal + tax`. |
| `notes` | string | N | | Free text printed on the PDF. |
| `status` | enum | Y | `approved` | `draft` → `pending` → `approved` \| `rejected` (rejected can go back to `draft`/`pending`). |
| `createdBy` / `createdAt` | string | Y / N | | Author and creation time. |
| `updatedBy` / `updatedAt` | string | N | | Last edit. |
| `submittedBy` / `submittedAt` | string | N | | Set when sent for approval. |
| `approvedBy` / `approvedAt` | string | N | | Set on approval. |
| `rejectedBy` / `rejectedAt` | string | N | | Set on rejection. |
| `rejectionReason` | string | N | `ราคาไม่ตรงกับใบเสนอราคา` | Required when rejecting. |
| `redoAt` | string (timestamp) | N | | Sent back to Sales for revision. |
| `resubmittedAt` | string (timestamp) | N | | Fixed and resubmitted. |
| `fromPO` | string | N | `PO20260915001` | Source purchase order when converted. Foreign key → `purchaseOrders.id`. |
| `dueDate` | string (date) | N | `2026-10-13` | Invoices and tax invoices only (empty for a bill). Defaults to `date` + 30 days in the form; older records without it use the same rule. Must not be before `date`. |
| `validUntil` | string (date) | N | `2026-12-12` | Quotations only. Defaults to `date` + 30 days; must not be before `date`. After it passes with no answer the quotation shows as expired (it can still be accepted). |
| `acceptedBy` / `acceptedAt` | string | N | | Quotations: the customer accepted (recorded by Sales, Manager or Admin). |
| `jobId` | string | N | `PO20261120001` | Quotations: the job opened on acceptance. Foreign key → `purchaseOrders.id`. |
| `declinedBy` / `declinedAt` / `declineReason` | string | N | `ราคาสูงไป` | Quotations: the customer declined; the reason is required. |
| `fromQuotation` | string | N | `DOC-2026-1101` | Invoices made from a job that came from a quotation. Foreign key → `quotations.id`. |
| `payments` | array of Payment | N | | Money received against an approved invoice / tax invoice; see 1b. Never deleted, only voided. |

**Payment status** is calculated, not stored. A bill (ใบเสร็จ) is a receipt, so it is paid when issued and has no payments. For an approved invoice or tax invoice:

- *settled* = Σ (`amount` + `wht`) of payments without `voidedAt`
- *balance* = `total` − settled → **paid** when 0, **part paid** when something is settled, otherwise **unpaid**
- **overdue** when not paid and today is after `dueDate`

### 1a. Item (inside `quotations.items` and `purchaseOrders.items`)

| Field | Type | Req | Description |
|---|---|---|---|
| `name` | string | Y | Product or service name. |
| `description` | string | N | Detail line (documents only). |
| `qty` | number | Y | > 0. |
| `price` | number | Y | Unit price ≥ 0. |

### 1b. Payment (inside `quotations.payments`)

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `PAY-MI3K2Q8Z` | `PAY-` + time stamp in base 36. |
| `date` | string (date) | Y | `2026-10-10` | Day the money arrived. Not in the future. Used for "Money received" in the Monthly Report. |
| `amount` | number | Y | `124800` | Cash received, ≥ 0. |
| `wht` | number | Y | `3600` | Withholding tax (หัก ณ ที่จ่าย) the customer deducted and paid to the Revenue Department for us, ≥ 0. The "Withheld 3%" button fills 3% of the pre-VAT part of this payment. Settles the invoice like cash; the customer issues a 50 ทวิ certificate for it. |
| `method` | enum | Y | `transfer` | `transfer` \| `promptpay` \| `cash` \| `cheque`. |
| `ref` | string | N | `KBank 1010-552` | Transfer reference or cheque number. |
| `note` | string | N | | |
| `by` / `at` | string | Y | | Who recorded it (Sales, Manager or Admin) and when. |
| `voidedBy` / `voidedAt` / `voidReason` | string | N | `Wrong amount typed` | Set when a Manager or Admin voids the payment. A voided payment no longer counts toward the balance. |

Rules: `amount + wht` must be > 0 and may not exceed the balance (no over-payment). These checks run in the browser only; the database rule for `quotations` checks sign-in, not role (future work, see `SECURITY.md`).

## 2. `purchaseOrders`

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `PO20261015001` | Primary key. `PO` + date + 3-digit sequence. The sequence continues after the highest number used that day (live or archived), so a number is never reused. |
| `date` | string (date) | Y | `2026-10-15` | |
| `customer` | string | Y | | Used by the customer filter. |
| `items` | array of Item | Y | | See 1a. |
| `subtotal`, `tax`, `total` | number | Y | | Same rules as documents. |
| `notes` | string | N | | |
| `status` | enum | Y | `open` | `open` → `in-progress` → `completed`. |
| `linkedInvoiceId` | string \| null | N | `QT20261015015` | Set when converted. Foreign key → `quotations.id`. |
| `fromQuotation` | string | N | `DOC-2026-1101` | Set when the job was opened by accepting a quotation (same items and totals). Foreign key → `quotations.id`. When converted, the invoice copies the quotation's tax ID, email, address and VAT setting. |
| `createdBy` / `createdAt` | string | Y | | |

## 3. `poCosts`

| Field | Type | Req | Example | Description |
|---|---|---|---|---|
| `id` | string | Y | `COST-1760500000000` | Primary key. |
| `poId` | string | Y | `PO20261015001` | Foreign key → `purchaseOrders.id`. |
| `type` | enum | Y | `material` | `labor` \| `transport` \| `material` \| `other`. |
| `description` | string | Y | `เหล็กกล่อง 2x2` | |
| `amount` | number | Y | `3200` | > 0. |
| `supplier` | string | N | | Only for `material`. |
| `date` | string (date) | Y | | |
| `createdBy` | string | Y | | |

## 4. `materialPrices`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | string | Y | `MAT-<timestamp>`, primary key. |
| `materialName` | string | Y | Grouping key for the comparison view. |
| `supplier` | string | Y | Used by the supplier filter. |
| `pricePerUnit` | number | Y | Lowest per material is marked **Cheapest**. |
| `date` | string (date) | Y | Used by the date-range filter. |
| `poId` | string \| null | N | Source PO when entered as a material cost. |
| `notes` | string | N | |

## 5. `customers`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | string | Y | `CUST001` / `CUST<timestamp>`, primary key. |
| `name` | string | Y | Matched by name when filling a document. |
| `type` | enum | Y | `company` \| `individual`. |
| `email`, `phone`, `address` | string | N | |
| `taxId` | string | N | Required for `company`. |

## 6. `products`

| Field | Type | Req | Description |
|---|---|---|---|
| `id` | string | Y | `PROD001` / `PROD<timestamp>`. |
| `name` | string | Y | |
| `description` | string | N | |
| `price` | number | Y | Default unit price. |
| `unit` | string | N | e.g. `งาน`, `ชั่วโมง`. |

## 6a. `stockItems` (Technician / Manager / Admin write)

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `STK-005` | Primary key. `STK-` + 3-digit sequence after the highest in use. |
| `name` | string | Y | `ลวดเชื่อม 2.6 มม. (กล่อง 5 กก.)` | Item name. Copied into each `stockMoves.itemName`. |
| `category` | enum | Y | `steel` | `electrical` \| `steel` \| `construction` \| `maintenance` \| `other`. |
| `unit` | string | Y | `กล่อง` | Unit of count. |
| `qty` | number | Y | `0` | On hand, ≥ 0, 2 dp. Changed only by a stock move (or the opening balance when the item is created). |
| `minQty` | number | Y | `3` | Safety stock (the reorder level; shown as "Safety stock" in the app), ≥ 0. **Low** when `qty ≤ minQty`; **Out** when `qty ≤ 0`. Low/out items raise the Stock badge, the Overview/Stock banner and the sign-in warning. |
| `maxQty` | number \| null | N | `20` | Full level. A purchase request tops the item up to it; when empty, twice `minQty`. |
| `supplier` | string | N | `บจก. ภูเก็ตเหล็กไทย` | Usual supplier; updated when goods are received. |
| `unitCost` | number \| null | N | `520` | Last price paid per unit (THB); updated when goods are received. |
| `updatedBy` / `updatedAt` | string | N | | Last change to the item or its quantity. |

## 6b. `stockMoves` (append-only log)

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `MOV-1762414500000` | Primary key. `MOV-<timestamp>`. |
| `itemId` | string | Y | `STK-005` | Foreign key → `stockItems.id`. |
| `itemName` | string | Y | | Name at the time of the move (kept if the item is renamed or deleted). |
| `type` | enum | Y | `out` | `in` (Receive, adds) \| `out` (Use, subtracts; cannot exceed `qty`) \| `count` (stock-take, sets `qty`). |
| `qty` | number | Y | `2` | Amount moved, > 0. For `count`, the size of the correction. |
| `after` | number | Y | `0` | `stockItems.qty` after this move. |
| `jobId` | string | N | `PO20261015001` | Only for `out`. Foreign key → `purchaseOrders.id`. |
| `note` | string | N | `งานโครงหลังคา` | Free text, ≤ 140 chars. |
| `date` | string (date) | Y | `2026-11-06` | |
| `at` / `by` | string | Y | | Timestamp and user email. |

## 6c. `purchaseRequests` (Technician / Manager / Admin write; never deleted)

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `PR-2026-0005` | Primary key. `PR-YYYY-NNNN`, sequence per year. |
| `date` | string (date) | Y | `2026-11-07` | Request date. The technician monthly limit counts requests by this date. |
| `itemId` / `itemName` / `unit` | string | Y | `STK-002` | Foreign key → `stockItems.id`, with the name and unit copied at request time. |
| `qty` | number | Y | `4` | > 0. Suggested as `maxQty − qty` of the item. |
| `supplier` | string | N | `ร้านเจริญการไฟฟ้า` | Cheapest in `materialPrices` for this item name, else the item's usual supplier. |
| `unitPrice` / `total` | number | Y | `2850` / `11400` | THB. `total = round2(qty × unitPrice)`. `0` = price not known yet: the requester may leave it empty (it is pre-filled when Supplier Prices or the item's last cost knows it); such a request goes to a Manager, who adds the price before approving. |
| `pricedBy` / `pricedAt` | string | N | | Set when an approver added the price. If the priced total is above `managerMax`, `approvalLevel` becomes `owner` and the request stays `pending` for the Owner. |
| `jobId` | string | N | `PO20261015001` | Optional job. Foreign key → `purchaseOrders.id`. |
| `note` | string | N | | ≤ 140 chars. |
| `source` | enum | Y | `manual` | `manual` \| `auto` (created when stock reached its safety stock level). |
| `approvalLevel` | enum | Y | `manager` | `auto` (total ≤ autoApprove, and a technician still within techMonthly) \| `manager` (≤ managerMax, or no price) \| `owner`. |
| `status` | enum | Y | `pending` | `pending` → `approved` → `ordered` → `received`; or `rejected` / `cancelled`. Receiving is allowed from `approved` too. |
| `requestedBy` / `requestedAt` | string | Y | `wichai@baigamgab.co` | `system` for automatic requests. |
| `approvedBy` / `approvedAt` | string | N | | `system` when approved automatically. |
| `rejectedBy` / `rejectedAt` / `rejectReason` | string | N | | Reason is required. |
| `orderedBy` / `orderedAt` | string | N | | Set by Manager / Admin. |
| `receivedBy` / `receivedAt` | string | N | | Receiving adds a `stockMoves` `in` entry, a `poCosts` material cost when `jobId` is set, and a `materialPrices` entry. |
| `receivedQty` / `receivedPrice` / `receivedTotal` | number | N | | What actually arrived and its price. |
| `cancelledBy` / `cancelledAt` | string | N | | Requests are cancelled, never deleted. |

Approval rules: nobody approves their own request except Admin (the owner); a Manager approves only `manager`-level requests; technicians never approve. These limits are checked in the app; the database rules check only the role.

## 7. `companyInfo` (single object, Admin-only write)

`name`, `address`, `phone`, `email`, `taxId`, `website` (strings), plus `_seed` (number, a version marker for the default values) and `purchaseLimits` (object, THB: `autoApprove` default 3,000, `managerMax` default 30,000, `techMonthly` default 10,000; edited in Admin → Company).

## 8. `users/{uid}` (Admin / Manager write)

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name. |
| `email` | string | Sign-in email (Firebase Authentication). |
| `role` | enum | `admin` \| `manager` \| `sales` \| `technician`. Validated by the database rules. |
| `createdAt` | string (timestamp) | |

## 8a. Pictures: `userPhotos/{uid}` and `stockImages/{itemId}`

Each record is one string: a 256 × 256 JPEG as a data URL (`data:image/jpeg;base64,…`), shorter than 60,000 characters (checked by the rules). The app redraws every chosen photo to this size first, which also drops hidden data such as GPS position. `null` removes the picture.

| Node | Key | Fit | Read | Write |
|---|---|---|---|---|
| `userPhotos/{uid}` | Firebase Auth user ID | Cropped to fill the square | Own photo; Manager / Admin read all | Own photo; Admin may remove any |
| `stockImages/{itemId}` | Foreign key → `stockItems.id` | Whole picture on white | Any signed-in user | Manager / Admin |

Pictures are kept apart from `stockItems` because that list is written whole. A deleted item keeps its picture, so restoring it from the Archive brings the picture back. The user's own photo is cached in `localStorage.userPhoto:<uid>`; stock pictures are not cached, so offline they show a placeholder.

**Accessibility settings** are not in the database. They are kept in the browser per user: `localStorage.a11y:<uid>` (and `a11y`, the last one used, for the sign-in page): `text` 100 | 115 | 130 | 150, `colors` default | safe | mono, `contrast`, `marks`, `motion` (true / false).

## 9. `archive/{list}/{id}` — soft delete and archive

When a record is deleted, or archived because it is old and closed, it is **moved** here, not erased.
`{list}` is the node it came from (`quotations`, `purchaseOrders`, `poCosts`, `materialPrices`, `customers`, `products`, `stockItems`) and `{id}` is the record's own `id`.
The record keeps every original field and gains three more:

| Field | Type | Req | Example | Description |
|---|---|---|---|---|
| `inactiveAt` | string (timestamp) | Y | `2026-10-15T05:00:00.000Z` | When it was deleted or archived. Indexed (`.indexOn`), so the Archive tab queries the newest 200 per list on the server. |
| `inactiveBy` | string | Y | `preecha@baigamgab.co` | Who did it. |
| `inactiveReason` | enum | Y | `archived` | `deleted` (user pressed Delete) \| `archived` (removed by the old-records query). Validated by the rules. |

Restoring a record strips these three fields, puts it back in its live list and removes the archive entry.

**Dead-data query (Admin → Archive):** archive records that match

```
quotations     where status ∈ {approved, rejected} and date < today − N months
purchaseOrders where status = completed            and date < today − N months
               (plus their poCosts)
```

N is 3, 6, 12 (default) or 24. Drafts, pending documents and open POs are never archived.

## 10. Monthly report (derived, not stored)

The Monthly Report page and the Overview revenue figures are calculated from `quotations`; nothing extra is saved.

```
revenue (incl. VAT) = Σ total     of quotations where status = approved and date in month
net before VAT      = Σ subtotal  (same set)
output VAT          = Σ tax       (same set)
not counted yet     = quotations where status = pending and date in month
job costs           = Σ poCosts.amount where date in month
```

The only browser-side keys are `localStorage.reportSeen` (`YYYY-MM`, so "report ready" shows once a month) and `sessionStorage.lowStockShown` (the sign-in low-stock warning shows once per session).
