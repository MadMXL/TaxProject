# Bills & Tax Manager

A simple billing and tax invoice management system for SMEs.

## How to Use

1. Open `index.html` in your web browser
2. Start managing your quotations!

## Features

- Dashboard with revenue overview
- Group bills by date or customer
- Combined filters: customer/supplier + date range + type + status + search
- Create new quotations
- Generate PDF invoices
- Export the filtered list to CSV
- Soft delete: deleted and old records move to an archive (Admin → Archive) and can be restored
- Mobile responsive

## Data

- Every database node and field is described in [DATA-DICTIONARY.md](DATA-DICTIONARY.md).
- Deploy [database.rules.json](database.rules.json) to Firebase (Realtime Database → Rules).
  The archive (soft delete) only works once these rules are deployed.

## Project Structure

```
bills-tax-clean/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── data.js
    ├── ui.js
    ├── functions.js
    └── app.js
```

## Customization

- **Change tax rate:** Edit `0.07` in `js/functions.js` (line 15 and 37)
- **Change colors:** Edit the design tokens at the top of `css/styles.css`
- **Add company name:** Edit text in `js/ui.js` (line 8)

## Technologies

- HTML5
- CSS (custom design tokens, no framework)
- Firebase Realtime Database + Authentication
- JavaScript (Vanilla)
- jsPDF (PDF generation)

---

**Made for SME businesses**
