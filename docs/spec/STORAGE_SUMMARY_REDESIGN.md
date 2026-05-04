# Handoff: Storage Summary Dashboard

## Overview

This package contains the redesigned **Storage Summary** dashboard page for Drive Duplicate Cleaner — a free, open-source web app that scans Google Drive for duplicate files and helps users safely remove them.

The dashboard is the main landing screen after login, giving users an at-a-glance overview of their storage usage, file type breakdown, last scan results, and recent file activity.

---

## Implementation Notes

> These decisions were made during pre-implementation review and override the original design reference where they conflict.

| # | Decision |
|---|---|
| 1 | **No search in Top Bar.** The search input is excluded entirely. The Top Bar contains only the breadcrumb. |
| 2 | **Duplicates stat is a placeholder.** The Quick Scan panel shows a hardcoded placeholder for the Duplicates count. A `// TODO` comment marks the location. Calculating the true total from `scanResults` is deferred. |
| 3 | **Keep existing segment colors.** Allocation bar keeps the current terminal palette (`#00F0FF`, `#00DBE9`, `#007981`, `#3B494B`) — do not adopt the spec's green/amber/purple. |
| 4 | **State labels follow the spec.** Use `HEALTHY` / `MODERATE` / `HIGH` (replacing `OPTIMAL` / `MODERATE` / `CRITICAL`). |
| 5 | **Update components in-place.** `QuickScanCard.tsx` and `RecentFileActivity.tsx` are updated to the new design. No old files left behind. Reuse existing logic and props where possible. |

---

## About the Design Files

The file `Storage Summary Dashboard.html` in this bundle is a **design reference created in HTML** — an interactive prototype showing the intended look and behavior. It is **not production code to copy directly**.

Your task is to **recreate this design in the target codebase's existing environment** using its established patterns, component libraries, and routing conventions.

**Fidelity: High-fidelity.** Colors, typography, spacing, border radii, shadows, and interactions are all final. Implement pixel-precisely from this spec, except where the Implementation Notes above override it.

---

## Screens / Views

### Storage Summary Dashboard

**Purpose:** Give users an overview of their Google Drive storage — how much is used, what types of files are using it, when the last scan ran, and what files were recently modified.

**Overall Layout:**
- Full viewport, `display: flex`, `flex-direction: row`
- Left: **Sidebar** (fixed `180px`) — already implemented in `__root.tsx`, no changes needed
- Right: **Main content** (`flex: 1`, `overflow: auto`)
  - Stacks vertically: Top Bar → Page content (padded `28px 32px`)

---

## Component Specs

### Sidebar

Already implemented in `__root.tsx`. **STORAGE SUMMARY** is already marked as the active item above "Files by Category." No changes needed.

---

### Top Bar

Height `56px`, `padding: 0 32px`, `display: flex`, `align-items: center`

| Property | Light | Dark |
|---|---|---|
| Background | `--theme-topbar-bg` | `--theme-topbar-bg` |
| Border-bottom | `1px solid --theme-topbar-border` | `1px solid --theme-topbar-border` |

**Left: Breadcrumb only** *(search input excluded — see Implementation Notes)*
- "Cleanup" → `--theme-text-dim`, weight `600`, font-size `11px`, uppercase, letter-spacing `0.08em`
- "/" separator: `--theme-text-dim`
- "Storage Summary" → `--theme-accent`, weight `700`

---

### Page Title Row

`display: flex`, `align-items: flex-end`, `justify-content: space-between`, `margin-bottom: 20px`

**Left:**
- Eyebrow: "System Storage Overview", `font-size: 10px`, weight `700`, letter-spacing `0.14em`, uppercase, color: `--theme-text-secondary`
- Title: "STORAGE SUMMARY", `font-size: 38px`, weight `900`, Barlow Condensed, letter-spacing `-0.01em`, uppercase
- Color: `--theme-text-primary`

**Right: State badge**
- Label: "STATE", `font-size: 10px`, weight `700`, uppercase
- Badge: pill with state label — `HEALTHY` / `MODERATE` / `HIGH`
  - HEALTHY → `--theme-accent`
  - MODERATE → `#f5a623`
  - HIGH → `--theme-danger`
- Badge: `background` = state color at 10% opacity, `border` = `1px solid` state color at 27% opacity, `border-radius: 4px`, `padding: 4px 10px`, `font-size: 10px`, weight `800`, letter-spacing `0.12em`, uppercase

---

### Hero Storage Card

Full-width card, `border-radius: 10px`, `padding: 24px 28px`, `border-left: 4px solid` state color

| Property | Token |
|---|---|
| Background | `--theme-card-bg` |
| Border | `1px solid --theme-card-border` |
| Shadow | `--theme-card-shadow` |

**Used / Total display** (`margin-bottom: 20px`):
- Used value: `font-size: 52px`, weight `900`, Barlow Condensed, letter-spacing `-0.02em`, line-height `1`, color: `--theme-text-primary`
- "/ 15.0 GB": `font-size: 20px`, weight `600`, Barlow Condensed, color: `--theme-text-secondary`
- Capacity badge: same styling as state badge — "Capacity: 70%"

**Allocation Distribution bar** (`margin-bottom: 20px`):
- Label: "ALLOCATION DISTRIBUTION", `font-size: 9px`, weight `700`, letter-spacing `0.14em`, uppercase, color: `--theme-text-secondary`, `margin-bottom: 8px`
- Track: height `8px`, border-radius `4px`, background = `--theme-border`
- Segments: keep existing terminal-palette colors from `ALLOCATION_SEGMENTS` in `dashboard.tsx`
- Legend below bar (`margin-top: 8px`, `gap: 20px`):
  - Color dot: `8×8px`, `border-radius: 2px` + label `font-size: 10px`, weight `600`, letter-spacing `0.06em`, color: `--theme-text-secondary`

**Breakdown columns** (`display: grid`, `grid-template-columns: repeat(4, 1fr)`):
- Columns: IMAGES / VIDEOS / AUDIO / DOCS (columns 2–4 have `border-left: 1px solid --theme-card-border`, `padding-left: 20px`)
- Label: `font-size: 9px`, weight `700`, uppercase, letter-spacing `0.12em`, color: `--theme-text-secondary`, `margin-bottom: 4px`
- Value: `font-size: 24px`, weight `900`, Barlow Condensed, color = segment color from `ALLOCATION_SEGMENTS`

---

### Bottom Two-Column Grid

`display: grid`, `grid-template-columns: 1fr 1.6fr`, `gap: 16px`

#### Left: Quick Scan Panel (`QuickScanCard.tsx`)

`border-radius: 10px`, `padding: 24px`, `border-left: 4px solid --theme-accent`, `display: flex`, `flex-direction: column`

**Header row** (`display: flex`, `align-items: flex-start`, `justify-content: space-between`, `margin-bottom: 12px`):
- Title: "QUICK SCAN V2", `font-size: 13px`, weight `800`, Barlow Condensed, uppercase, letter-spacing `0.1em`, color: `--theme-accent`
- Description: `font-size: 12px`, color: `--theme-text-secondary`, line-height `1.6`, `max-width: 220px`
- Icon: `32×32px`, `border: 1px solid --theme-card-border`, `border-radius: 6px`

**Scan stats row** (`padding-top: 12px`, `border-top: 1px solid --theme-card-border`, `display: flex`, `gap: 16px`):
- Three stat blocks: Last Scan / Objects / Duplicates
- Each: label (`font-size: 9px`, uppercase, `--theme-text-dim`, `margin-bottom: 2px`) + value (`font-size: 12px`, weight `600`, JetBrains Mono, `--theme-body-text`)
- "Duplicates" value: `--theme-accent`
- **Duplicates count is a placeholder** — hardcode a value and leave a `// TODO` to wire up the real total from `scanResults`. Show `—` when no scan has run.

**Re-Execute Scan button** (full width):
- Background: `--theme-accent`
- Text color: `#ffffff` (light) / `#0a1a16` (dark)
- `border-radius: 7px`, `padding: 11px 0`, `font-size: 11px`, weight `800`, uppercase, letter-spacing `0.1em`
- Includes refresh icon + label "RE-EXECUTE SCAN" (or "EXECUTE SCAN" if no prior scan)

---

#### Right: Recent File Activity Table (`RecentFileActivity.tsx`)

`border-radius: 10px`, `overflow: hidden`

**Panel header** (`padding: 16px 20px`, `border-bottom: 1px solid --theme-card-border`):
- Title: "Recent File Activity", `font-size: 11px`, weight `800`, Barlow Condensed, uppercase, letter-spacing `0.1em`
- Badge: "Storage Size" — `--theme-accent` color, same badge styling as state badge

**Table header** (`padding: 8px 20px`, background: `--theme-page-bg`):
- Columns: `grid-template-columns: 120px 1fr 80px`
- "Date Modified" / "Name" / "Size"
- `font-size: 9px`, weight `700`, uppercase, letter-spacing `0.12em`, color: `--theme-text-dim`

**File rows** (`padding: 10px 20px`, `border-bottom: 1px solid --theme-file-row-border`, `cursor: pointer`):
- On hover: `rgba(0,0,0,0.02)` light / `rgba(255,255,255,0.02)` dark
- **Date**: `font-size: 11px`, color: `--theme-text-secondary`, JetBrains Mono
- **Name cell**: file icon (Lucide, 13×13, color `--theme-caret-color`) + filename `font-size: 12px`, color: `--theme-body-text`, ellipsis overflow
- **Size**: `font-size: 11px`, color: `--theme-text-secondary`, JetBrains Mono, `text-align: right`

---

## Design Tokens

All tokens map to existing CSS variables in `index.css`. No new variables need to be added.

| Spec token | CSS variable |
|---|---|
| pageBg | `--theme-page-bg` |
| topbarBg / cardBg | `--theme-topbar-bg` / `--theme-card-bg` |
| cardBorder | `--theme-card-border` |
| accent | `--theme-accent` |
| danger | `--theme-danger` |
| titleText | `--theme-text-primary` |
| bodyText | `--theme-body-text` |
| metaText | `--theme-text-secondary` |
| dimText | `--theme-text-dim` |
| barTrack | `--theme-border` |
| tableHeaderBg | `--theme-page-bg` |
| tableRowHover | inline rgba |
| tableRowBorder | `--theme-file-row-border` |

---

## Typography

All fonts are already configured in `tailwind.config.ts`:

| Token | Tailwind class |
|---|---|
| Display / condensed | `font-barlow-condensed` |
| Monospace | `font-jetbrains` |
| UI font | `font-barlow` |

---

## State Logic

```
type StorageState = 'HEALTHY' | 'MODERATE' | 'HIGH'

// Derived from usage percentage:
pct >= 80  → HIGH     (--theme-danger,  #e84040)
pct >= 60  → MODERATE (#f5a623)
pct < 60   → HEALTHY  (--theme-accent)

// Applied to:
// - hero card left border
// - capacity badge
// - state badge in page title row
```

---

## Assets

- **Fonts:** Already loaded — Barlow Condensed and JetBrains Mono configured in `tailwind.config.ts`
- **Icons:** Use Lucide React icons already in the project. Inline SVG only where Lucide has no equivalent.

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `STORAGE_SUMMARY_REDESIGN.md` | This document — full implementation spec |
| `Storage Summary Dashboard.html` | Interactive design reference — Light + Dark themes |
