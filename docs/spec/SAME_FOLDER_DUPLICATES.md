# Handoff: Same Folder Duplicates Page

## Overview

This package contains the **Same Folder Duplicates** page for Drive Duplicate Cleaner — a screen that shows duplicate files that live in the exact same Google Drive folder, grouped by folder path with duplicate sets nested inside each folder.

---

## About the Design Files

`Same Folder Duplicates.html` is a **design reference created in HTML** — an interactive prototype showing intended look and behavior. It is **not production code to copy directly**. Recreate it in your target codebase using its established patterns.

**Fidelity: High-fidelity.** All colors, spacing, typography, and interactions are final.

---

## Key UX Concept

Unlike the general Duplicates page (which groups by similarity across any location), this page groups files that are **co-located** — duplicates living in the same folder. The hierarchy is:

```
📁 Folder Path                     ← collapsible folder heading
   └─ Duplicate Set 1 (N files)    ← accordion
        file_a.pdf
        file_a (1).pdf
   └─ Duplicate Set 2 (N files)    ← accordion
        budget.xlsx
        budget (copy).xlsx
```

**Selection model:** Users check files they want to **delete**. At least one file per set must remain unchecked (kept). The UI warns when all files in a set are selected.

---

## Layout

- Full viewport `display: flex` row
- Left: **Sidebar** `180px` — same as all other pages, "SAME FOLDER" active
- Right: **Main content** `flex: 1`, `overflow: auto`
  - Top Bar (56px) → Filter/Info Bar (44px) → Keep Hint Callout → Folder Groups list

---

## Component Specs

### Top Bar

Height `56px`, `padding: 0 32px`, same styling as Duplicate Results page.

**Left:** Folder icon (17×17) + "Same Folder Duplicates" label, `font-size: 13px`, weight `600`, uppercase

**Center stats:**
- `N folders` · `N sets` · `N MB recoverable` (recoverable in accent color)

**Right: Delete button** — same spec as Duplicate Results page, counts selected files.

---

### Filter / Info Bar

Height `44px`, `padding: 0 32px`, background = filterBg, border-bottom = filterBorder

**Left section:**
- Folder icon (12×12) + "Grouped by folder" label — `font-size: 10px`, weight `700`, uppercase, metaText color
- Vertical divider `1×16px`
- "Files in each set share the exact same location" — `font-size: 10px`, weight `600`, dimText

**Right: Search input** — same spec as Duplicate Results page, placeholder "Search folders or filenames…", `width: 180px`

---

### Keep Hint Callout

Sits between filter bar and folder list. `padding: 12px 32px 0`.

Container: `background` = warnBg, `border: 1px solid` warnBorder, `border-radius: 7px`, `padding: 9px 14px`

- Warning icon SVG (13×13, circle with `!`, stroke = warnIcon color)
- Text: `font-size: 11px`, color: warnText, weight `600`, line-height `1.5`
- Copy: **"To keep a file:"** leave it unchecked. Only check the files you want to **delete**. At least one file in each set must remain unchecked.

| Property | Light | Dark |
|---|---|---|
| warnBg | `rgba(245,166,35,0.08)` | `rgba(245,166,35,0.07)` |
| warnBorder | `rgba(245,166,35,0.3)` | `rgba(245,166,35,0.2)` |
| warnText | `#b8750f` | `#f5a623` |
| warnIcon | `#f5a623` | `#f5a623` |

---

### Folder Group

`display: flex`, `flex-direction: column`, `gap: 0`. Top-level item in the list (`gap: 16px` between groups).

#### Folder Heading Card

`border-radius: 10px` when collapsed, `border-radius: 10px 10px 0 0` when expanded. `padding: 14px 20px`. Clickable — collapses/expands the sets inside.

**Left: Folder identity** (`display: flex`, `align-items: center`, `gap: 10px`):
- Icon container: `32×32px`, `border-radius: 7px`, background = folderPathBg, border = `1px solid` folderPathBorder
  - Folder SVG icon `16×16`, stroke = accent
- Label stack:
  - Eyebrow: "Same Folder", `font-size: 9px`, weight `700`, uppercase, letter-spacing `0.1em`, metaText
  - Path: `font-size: 13px`, weight `700`, JetBrains Mono, titleText — placeholder shown as `PATH/TO/GOOGLE/DIR`

**Right: Badges** (`gap: 8px`):
- "N duplicate sets" badge — sameFolderBg / sameFolderText / sameFolderBorder
- "N MB recoverable" badge — countBadgeBg / countBadgeText
- "N selected" badge (shown when files are selected) — cardBorderSel tint

| Property | Light | Dark |
|---|---|---|
| sameFolderBg | `rgba(0,184,148,0.08)` | `rgba(0,201,167,0.08)` |
| sameFolderBorder | `rgba(0,184,148,0.25)` | `rgba(0,201,167,0.2)` |
| sameFolderText | `#00916e` | `#00c9a7` |

**Caret:** 14×14 SVG, rotates `-90deg` when collapsed, `0deg` when expanded.

#### Nested Sets Container

Shown when folder is expanded. `border: 1px solid` folderBorder, `border-top: none`, `border-radius: 0 0 10px 10px`, `padding: 12px 16px 16px`.

**Context strip** (top of container, `padding-bottom: 10px`, `border-bottom: 1px solid` expandedBorder):
- Small folder icon (11×11, folderIcon color) + "All files below are located in" (metaText, `font-size: 10px`, JetBrains Mono) + path value (accentText, weight `700`)

**Duplicate sets list:** `display: flex`, `flex-direction: column`, `gap: 8px`

---

### Duplicate Set (Accordion)

`border-radius: 8px`, `border: 1px solid` setBorder (or cardBorderSel when selected), background = setBg

#### Set Header Row

`border-left: 3px solid` accent

**Left icon** (`padding: 13px 12px`): File document SVG 13×13, stroke = accent

**File info** (`flex: 1`, `padding: 13px 0`, clickable):
- Badge row (`gap: 8px`, `margin-bottom: 4px`):
  - "Exact Match" badge — accent colors, same spec as Duplicate Results page badges
  - "N files" count badge
  - "N selected · keep 1!" warning badge — shown when files are selected (accent tint; adds "· keep 1!" warning when all files are selected)
- Filename preview: `font-size: 12px`, JetBrains Mono, filenameText, ellipsis, `max-width: 360px`

**Reclaim** (`padding: 13px 18px`, right-aligned):
- Label: "RECLAIM", `font-size: 10px`, uppercase, dimText
- Value: `font-size: 16px`, weight `800`, Barlow Condensed, accentText

**Caret:** 14×14, rotates on expand.

#### Expanded File List

background = expandedBg, `border-top: 1px solid` expandedBorder

**All-selected warning banner** (shown when every file in the set is checked):
- `padding: 8px 14px`, background = warnBg, `border-bottom: 1px solid` warnBorder
- Warning icon + "Deselect at least one file to keep it — all files are currently selected for deletion."
- `font-size: 10px`, weight `600`, warnText

**File rows** (`padding: 10px 14px 10px 44px`, `gap: 10px`):
- Checkbox: 13×13, accentColor = accent
- File icon: 13×13, stroke = accent (when selected) or fileIconColor (default)
- Filename: `font-size: 12px`, JetBrains Mono, bodyText/weight `600` (selected) or filenameText/weight `400` (default), ellipsis
- Size: `font-size: 11px`, weight `600`, sizeText, JetBrains Mono
- Modified date: `font-size: 11px`, dateText
- Row background: fileSelBg when selected, transparent otherwise

**Note:** Path column is intentionally omitted — all files share the same folder, shown in the context strip above.

---

## Design Tokens

### Light Theme
| Token | Value |
|---|---|
| pageBg | `#f5f5f0` |
| cardBg / folderBg / setBg | `#ffffff` / `#ffffff` / `#ffffff` |
| cardBorder | `#e8e8e2` |
| expandedBg | `#fafaf8` |
| accent | `#00b894` |
| amber (warn) | `#f5a623` |
| titleText | `#222222` |
| bodyText | `#333333` |
| metaText | `#888888` |
| dimText | `#aaaaaa` |
| fileSelBg | `rgba(0,184,148,0.04)` |

### Dark Theme
| Token | Value |
|---|---|
| pageBg | `#0f1014` |
| cardBg / folderBg | `#16171c` |
| setBg | `#13141a` |
| cardBorder | `#22242c` |
| expandedBg | `#0c0d10` |
| accent | `#00c9a7` |
| amber (warn) | `#f5a623` |
| titleText | `#e8eaf2` |
| bodyText | `#c8cad4` |
| metaText | `#4a4d5a` |
| dimText | `#333644` |
| fileSelBg | `rgba(0,201,167,0.05)` |

---

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| UI / body | Barlow | 12–13px | 400–600 |
| Headings / display | Barlow Condensed | 16–38px | 800–900 |
| Paths / filenames / sizes | JetBrains Mono | 10–13px | 400–700 |

---

## State & Interactions

```
// Per-file selection key: "{setId}::{fileIndex}"
selectedFiles: Set<string>

// Derived warnings:
allSelectedInSet = selectedFiles includes all files in a given set
  → show inline warning banner in expanded set
  → show "keep 1!" in selected count badge

// Folder collapse:
collapsed: boolean per folder (default: false = expanded)

// Set expand:
expanded: boolean per set (default: false = collapsed)
```

**Delete button:** activates when `selectedFiles.size > 0`. Shows "Delete N file(s)". Should trigger confirmation modal before executing (not included in this handoff).

**Search:** filters folders by path OR any filename match within sets.

---

## Assets

- **Icons:** Inline SVGs — folder (path-based), file (folded corner), chevron, warning circle, search
- **Fonts:** Barlow, Barlow Condensed, JetBrains Mono — Google Fonts

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `README.md` | This document |
| `Same Folder Duplicates.html` | Interactive design reference — Light + Dark themes |
