---
name: Baigamgab SmartLedger
description: Bilingual billing, jobs and stock ledger for a Thai engineering SME, set as an instrument panel.
colors:
  paper: "#F4F6F8"
  surface: "#FFFFFF"
  surface-2: "#EEF1F5"
  surface-3: "#E6EAF0"
  ink: "#1A2230"
  ink-2: "#4A5468"
  ink-3: "#7A8496"
  line: "#E4E8EE"
  line-2: "#CFD6E0"
  line-3: "#AEB8C6"
  brand: "#16233E"
  brand-2: "#101A30"
  brand-ink: "#EAF0F8"
  brand-ink-2: "#9FB0CC"
  accent: "#1F49A8"
  accent-wash: "#E9EEF9"
  focus: "#2F6FE0"
  st-draft: "#8A6D2F"
  st-pending: "#A6690B"
  st-approved: "#1C7A5A"
  st-rejected: "#C23B3B"
  st-info: "#1F49A8"
typography:
  h1:
    fontFamily: "Sarabun, system-ui, 'Segoe UI', 'Noto Sans Thai', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.07em"
rounded:
  control: "8px"
  card: "12px"
  sheet: "16px"
  pill: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.brand-2}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  chip-selected:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.pill}"
---

# Design System: Baigamgab SmartLedger

<!-- Inferred from css/styles.css on 2026-11-09. The descriptive language is mine (Claude), not confirmed by the user; revise freely. -->

## Overview

**Creative North Star: "The Site Ledger"**

SmartLedger is a ledger you trust at a glance, like a well-kept instrument panel in a site office. Navy chrome frames a cool, tinted paper ground. The data sits on white cards, and colour appears only when something has a state: draft, pending, approved, rejected, low. Hierarchy comes from size and weight in a single sans family (Sarabun), which carries Thai and English equally.

Density is moderate. The tables are real tables with tabular numerals, and filters sit in one card above the results they narrow. Motion only confirms that something changed: a view fades in over 220ms, sheets rise, and the toast "island" springs open.

**Key Characteristics:**
- One family (Sarabun) for everything, with tabular numerals throughout
- Navy chrome (sidebar, top bar, sheet heads) around a cool paper ground
- State colours as tokens, each paired with a wash for pills and notices
- Ring-plus-shadow elevation that reads in light and dark
- Bilingual by construction: every label lives in `LANG.en` and `LANG.th`

## Colors

A restrained cool palette: navy for chrome and primary actions, one blue accent, and state colours that appear only when a fact needs them.

### Primary
- **Site-Office Navy** (#16233E): the sidebar, top bar, sheet headers, primary buttons and selected chips. In dark mode it shifts slightly (#17233B) and stays the chrome colour.
- **Ledger Blue** (#1F49A8; #7FA8F5 in dark): links, the current bar in charts, selected palette rows, the running total. Never used for decoration.

### Neutral
- **Cool Paper** (#F4F6F8): the page ground. Never pure white.
- **Card White** (#FFFFFF), **Panel Mist** (#EEF1F5), **Panel Shade** (#E6EAF0): the surfaces, table headers and empty fills.
- **Ink ramp** (#1A2230 / #4A5468 / #7A8496): primary, secondary and tertiary text.
- **Line ramp** (#E4E8EE / #CFD6E0 / #AEB8C6): dividers, input borders and axis lines.

### State
- **Draft Ochre** (#8A6D2F), **Pending Amber** (#A6690B), **Approved Green** (#1C7A5A), **Rejected Red** (#C23B3B), **Info Blue** (#1F49A8). Each has a `-wash` background. Low stock reuses Rejected Red for "out" and Pending Amber for "low".

**The State-Only Rule.** Saturated colour means a state. If an element has no state, it is ink, line or navy.

## Typography

**Body and display font:** Sarabun (fallbacks: system-ui, Segoe UI, Noto Sans Thai)

**Character:** a plain, legible Thai-Latin sans. One family, weight steps only (400 / 500 / 600 / 700).

### Hierarchy
- **H1** (700, 1.75rem, 1.25): the page title in `.view-head`.
- **H2 / stat value** (700, 1.375rem, 1.1): KPI numbers and dialog titles.
- **Lede** (700, 1.125rem): section titles and sheet headings.
- **Body** (400, 0.875rem, 1.55): table cells and form text.
- **Label** (700, 0.75rem, 0.06–0.07em, UPPERCASE): card titles and table headers. Thai text ignores the uppercase.

**The Tabular Rule.** Every number that can be compared, including money, counts and quantities, uses `font-variant-numeric: tabular-nums`, and money columns are right-aligned.

## Layout

Desktop has a fixed 240px navy sidebar (208px between 769 and 900px) beside a fluid main column capped at 1180px with 24px gutters. At 768px and below the sidebar is replaced by a sticky top bar and a fixed bottom tab bar (60px, at most five items), and gutters drop to 12px. Each view stacks vertically with 24px gaps: a view header (title, one-line count, primary action on the right), then a filter card, then results. Two-column grids (`.grid-2`) collapse to one column at 520px. Wide tables scroll horizontally inside `.table-wrap` and never widen the page.

## Elevation & Depth

Depth is a ring plus a soft shadow, so cards stay crisp in both themes. Surfaces are flat at rest.

- **lift-1** (`0 0 0 1px var(--line), 0 1px 2px rgba(16,24,40,.04)`): cards, KPIs, stat tiles.
- **lift-2** (`0 0 0 1px var(--line), 0 10px 28px rgba(16,24,40,.10)`): the auth card.
- **lift-3** (`0 24px 56px rgba(16,24,40,.20)`): sheets, drawers, the palette, the island.

## Shapes

Radius depends on role: 8px for controls, 12px for cards, 16px for sheets, and pills for chips and status. Inputs and fieldsets use 1px line borders. Accent stripes are limited to the existing 3px left bar on KPI and stat tiles, and new components should not add more.

## Components

### Buttons
- **Primary:** navy fill, brand-ink text, 8px radius, 8×14 padding, 600 weight. Darker navy on hover, `scale(.98)` when pressed.
- **Secondary:** white fill with a line-2 border.
- **Danger:** a red wash that becomes solid red on hover.
- **Row actions (`.act`):** small text buttons tinted by meaning (primary blue, warn amber, danger red, positive green).

### Chips
Pill filters with a count (`.n`). Selected chips are navy with light text.

### Cards / Containers
White, 12px radius, lift-1. `.card-head` holds an uppercase label title and a right-aligned meta or action, above a line.

### Inputs / Fields
1px line-2 border, 8px radius. On focus the border turns focus blue with a 3px 18% halo. The label sits above the field at 0.75rem, weight 600.

### Navigation
Sidebar items are 17px stroke icons with labels. The current item gets a white 11% wash and a 3px accent-ink inset on the left. Group labels are 0.5625rem, uppercase and tracked. Badges are red pills with white numerals.

### Signature: the Island toast
A 40px dark dot that springs open to fit its message (success, error, warn, info), with an optional action such as Undo.

## Do's and Don'ts

### Do:
- **Do** add every new label to both `LANG.en` and `LANG.th`.
- **Do** build new pages from the existing primitives: `.view-head`, `.card`, `.table`, `.chips`, `.pill`, `.kpi`, `.notice`, `.sheet`.
- **Do** use state tokens (`--st-*` and their washes) for any warning, and pair colour with words and an icon.
- **Do** keep money right-aligned with tabular numerals, formatted with `fmt()` or `baht()`.

### Don't:
- **Don't** introduce a second font family or display face.
- **Don't** use colour on elements that have no state.
- **Don't** nest cards, or use same-size icon cards as page structure.
- **Don't** add decorative motion. Transitions stay at 120–250ms and only confirm a state change.
