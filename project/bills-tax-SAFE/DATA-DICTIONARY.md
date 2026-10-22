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
| `quotations` | array | Bills, invoices and tax invoices (all "documents") | Yes |
| `purchaseOrders` | array | Purchase orders before they become invoices | Yes |
| `poCosts` | array | Cost lines recorded against a purchase order | Yes |
| `materialPrices` | array | Price per unit per supplier, for comparison | Yes |
| `customers` | array | Customer master data | Yes |
| `products` | array | Product / service catalogue | Yes |
| `companyInfo` | object | Seller details printed on every document | Yes |
| `users/{uid}` | object per user | Name, email and role of each account | Admin pages only |
| `archive/{list}/{id}` | object keyed by record ID | Soft-deleted and archived records | **No**, only on demand |

---

## 1. `quotations` — documents

| Field | Type | Req | Example | Description / constraints |
|---|---|---|---|---|
| `id` | string | Y | `DOC-2026-0913` | Primary key. `DOC-YYYY-NNNN`; documents converted from a PO use `QTYYYYMMDDNNN`. |
| `date` | string (date) | Y | `2026-09-15` | Document date. Used by the date-range filter, grouping and archiving. |
| `docType` | enum | Y | `tax-invoice` | `bill` \| `invoice` \| `tax-invoice`. |
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

### 1a. Item (inside `quotations.items` and `purchaseOrders.items`)

| Field | Type | Req | Description |
|---|---|---|---|
| `name` | string | Y | Product or service name. |
| `description` | string | N | Detail line (documents only). |
| `qty` | number | Y | > 0. |
| `price` | number | Y | Unit price ≥ 0. |

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

## 7. `companyInfo` (single object, Admin-only write)

`name`, `address`, `phone`, `email`, `taxId`, `website` (strings), plus `_seed` (number, a version marker for the default values).

## 8. `users/{uid}` (Admin / Manager write)

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name. |
| `email` | string | Sign-in email (Firebase Authentication). |
| `role` | enum | `admin` \| `manager` \| `sales` \| `technician`. Validated by the database rules. |
| `createdAt` | string (timestamp) | |

## 9. `archive/{list}/{id}` — soft delete and archive

When a record is deleted, or archived because it is old and closed, it is **moved** here, not erased.
`{list}` is the node it came from (`quotations`, `purchaseOrders`, `poCosts`, `materialPrices`, `customers`, `products`) and `{id}` is the record's own `id`.
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
