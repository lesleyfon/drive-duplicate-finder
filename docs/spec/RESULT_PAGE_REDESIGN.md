# Handoff: Duplicate Results Page Redesign

## Overview

This package contains the redesigned **Duplicate Results** page for Drive Duplicate Cleaner — a free, open-source web app that scans Google Drive for duplicate files and helps users safely remove them.

The redesign replaces the existing dense accordion list with a cleaner, more breathable card-based accordion layout. It ships in **two themes** — Light and Dark — using a shared token system so both themes can be toggled at runtime.

---

## About the Design Files

The file `Duplicate Results Page.html` in this bundle is a **design reference created in HTML** — an interactive prototype showing the intended look and behavior. It is **not production code to copy directly**.

Your task is to **recreate this design in the target codebase's existing environment** (React, Vue, Next.js, etc.) using its established patterns, component libraries, and routing conventions. If no codebase environment exists yet, React + CSS Modules or Tailwind is recommended.

**Fidelity: High-fidelity.** Colors, typography, spacing, border radii, shadows, and interactions are all final. Implement pixel-precisely from this spec.

---

## Screens / Views

### 1. Results Page — Duplicate Groups List

**Purpose:** Show the user all detected duplicate file groups, allow filtering by match type, selecting groups, and deleting the duplicates.

**Overall Layout:**
- Full viewport, `display: flex`, `flex-direction: row`
- Left: **Sidebar** (fixed width `180px`)
- Right: **Main content area** (`flex: 1`, `overflow: auto`)
  - Stacks vertically: Top Bar → Filter Bar → Scrollable Group List

---

## Component Specs

### Sidebar

| Property | Value |
|---|---|
| Width | `180px` |
| Background (light) | `#f0f0ea` |
| Background (dark) | `#0d0e12` |
| Right border | `1px solid` — light: `#e0e0d8`, dark: `#1a1c22` |
| Font | Barlow Condensed, uppercase |

**Logo block** (top, `padding: 20px 18px 16px`):
- Logo text: "Drive / Duplicate / Cleaner", font-size `18px`, weight `900`, line-height `1.1`, uppercase
- Color — light: `#00b894`, dark: `#00c9a7`
- Subtitle: "DRIVE SCANNER V1", font-size `8px`, weight `700`, letter-spacing `0.1em`, color — light: `#999`, dark: `#3a3d48`

**Nav items** (`font-size: 9px`, `padding: 5px 18px`, `letter-spacing: 0.06em`):
- Active item ("DUPLICATES"): weight `700`, color — light: `#111`, dark: `#e8eaf0`, background — light: `rgba(0,0,0,0.05)`, dark: `rgba(255,255,255,0.04)`
- Inactive items: weight `500`, color — light: `#999`, dark: `#3a3d48`

Nav items list: DUPLICATES, SAME FOLDER, HIDDEN, EMPTY, LARGE, OLD, NOT OWNED BY ME, TYPE, ALL FILES

**Footer links** (bottom, separated by divider):
- STORAGE ANALYZER, BROWSE GROUPS, LOG OUT
- Font-size `9px`, weight `700`, color — light: `#999`, dark: `#3a3d48`

---

### Top Bar

Height `56px`, `padding: 0 32px`, `display: flex`, `align-items: center`, `gap: 24px`

| Property | Light | Dark |
|---|---|---|
| Background | `#ffffff` | `#16171c` |
| Border-bottom | `1px solid #e8e8e2` | `1px solid #22242c` |

**Left: Section label**
- Search icon (18×18, stroke color = accent)
- Text: "DUPLICATE FILES", `font-size: 13px`, weight `600`, letter-spacing `0.05em`, uppercase
- Color — light: `#222`, dark: `#e8eaf2`

**Center: Stats** (`font-size: 12px`, `gap: 20px`)
- "**57** groups" — bold value: light `#222`, dark `#e8eaf2`; label: light `#888`, dark `#4a4d5a`
- "**67** extra files" — same styling
- "**408.2 MB** recoverable" — value in accent color: light `#00b894`, dark `#00c9a7`

**Right: Delete button**
- Default (nothing selected): `background: #e8e8e2` (light) / `#1c1e26` (dark), `color: #aaa` (light) / `#3a3d4a` (dark), `cursor: default`
- Active (items selected): `background: #e84040` (light) / `#c0392b` (dark), `color: #fff`, `cursor: pointer`
- Padding `7px 18px`, border-radius `6px`, font-size `12px`, weight `700`, letter-spacing `0.06em`, uppercase
- Label: "Delete N selected" when active, "Delete selected" when inactive
- Transition: `all 0.2s`

---

### Filter Bar

Height ~`44px`, `padding: 0 32px`, `display: flex`, `align-items: center`, `gap: 4px`

| Property | Light | Dark |
|---|---|---|
| Background | `#ffffff` | `#16171c` |
| Border-bottom | `1px solid #e8e8e2` | `1px solid #22242c` |

**Filter tabs** — "All Types", "Exact Match", "Likely Duplicates", "Versions"
- `padding: 12px 16px`, `font-size: 11px`, weight `700`, letter-spacing `0.08em`, uppercase
- Active: color = accent (`#00b894` / `#00c9a7`), `border-bottom: 2px solid` accent
- Inactive: color — light `#999`, dark `#3a3d4a`, `border-bottom: 2px solid transparent`
- `transition: all 0.15s`

**Search input** (right-aligned)
- Container: `background` = page bg, `border: 1px solid` top-bar border, `border-radius: 6px`, `padding: 6px 12px`
- Search icon 13×13, stroke = caret color
- Input: `font-size: 12px`, `width: 140px`, no border, transparent background
- Placeholder: "Search filename…"
- Text color — light: `#555`, dark: `#c8cad4`

---

### Group List

`padding: 24px 32px`, `display: flex`, `flex-direction: column`, `gap: 12px`

Each group renders as an **accordion card**.

#### Group Card (collapsed)

| Property | Light | Dark |
|---|---|---|
| Background | `#ffffff` | `#16171c` |
| Border | `1px solid #e8e8e2` | `1px solid #22242c` |
| Border (selected) | `1px solid #00b894` | `1px solid #00c9a7` |
| Border-radius | `10px` | `10px` |
| Box-shadow | `0 1px 4px rgba(0,0,0,0.06)` | `0 1px 6px rgba(0,0,0,0.3)` |
| Box-shadow (selected) | `0 0 0 2px rgba(0,184,148,0.2)` | `0 0 0 2px rgba(0,201,167,0.15)` |
| Left border accent | `4px solid` — match-type color | same |
| Transition | `all 0.2s` | same |

**Card header row** (`display: flex`, `align-items: center`):

1. **Checkbox** (`padding: 16px 14px`):
   - 16×16, `accent-color` = accent color

2. **File info** (`flex: 1`, `padding: 16px 0`, `cursor: pointer`, triggers expand):
   - Badge row (`gap: 10px`, `margin-bottom: 5px`):
     - **Match type badge**: `font-size: 10px`, weight `700`, letter-spacing `0.08em`, uppercase, `border-radius: 4px`, `padding: 3px 8px`
       - Per-type colors → see Design Tokens section
     - **File count badge**: "N files", `font-size: 10px`, weight `700`, `border-radius: 4px`, `padding: 3px 8px`
       - Background — light: `#f5f5f0`, dark: `#1c1e26`; color — light: `#555`, dark: `#5a5d6a`
   - **Filename preview**: `font-size: 13px`, `font-family: 'JetBrains Mono', monospace`, `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`, `max-width: 480px`
     - Color — light: `#333`, dark: `#c8cad4`

3. **Reclaim size** (`padding: 16px 20px`, `text-align: right`):
   - Label: "RECLAIM", `font-size: 11px`, uppercase, letter-spacing `0.06em`, color — light: `#aaa`, dark: `#333644`, `margin-bottom: 2px`
   - Value: `font-size: 18px`, weight `800`, font Barlow Condensed, color = accent

4. **Chevron icon** (`padding: 16px 16px 16px 0`, `cursor: pointer`):
   - 16×16 SVG, stroke = caret color (light: `#aaa`, dark: `#3a3d4a`)
   - Rotates `180deg` when expanded, `transition: transform 0.2s`

#### Group Card (expanded — file list)

Appended below the header when expanded:

| Property | Light | Dark |
|---|---|---|
| Background | `#fafaf8` | `#0f1014` |
| Border-top | `1px solid #f0f0ec` | `1px solid #1c1e26` |

Each file row (`display: flex`, `align-items: center`, `gap: 12px`, `padding: 11px 20px 11px 52px`):
- Separated by `border-bottom: 1px solid` (row separator color — light: `#f0f0ec`, dark: `#1c1e26`), except the last row
- File icon: 14×14 SVG, stroke = icon color (light: `#ccc`, dark: `#2a2d38`)
- **Filename** (`flex: 1`, `font-size: 12px`, monospace, ellipsis): light `#444`, dark `#9a9daa`
- **Path** (`font-size: 11px`, `white-space: nowrap`): light `#aaa`, dark `#4a4d5a`
- **Size** (`font-size: 11px`, weight `600`, `white-space: nowrap`): light `#888`, dark `#6a6d7a`
- **Modified date** (`font-size: 11px`, `white-space: nowrap`): light `#bbb`, dark `#3a3d4a`

---

## Match Type Colors

| Type | Light bg | Light border/text | Dark bg | Dark border/text |
|---|---|---|---|---|
| EXACT MATCH | `#e8f5f2` | `#00b894` / `#007a5e` | `rgba(0,201,167,0.08)` | `#00c9a7` / `#00c9a7` |
| LIKELY DUPLICATE | `#fff8e6` | `#f5a623` / `#b8750f` | `rgba(245,166,35,0.08)` | `#f5a623` / `#f5a623` |
| POSSIBLE VERSION | `#eff3ff` | `#667eea` / `#4a5bd4` | `rgba(102,126,234,0.08)` | `#667eea` / `#8b9ef0` |

---

## Design Tokens

### Typography
| Token | Value |
|---|---|
| UI font | Barlow, sans-serif |
| Display / condensed | Barlow Condensed, sans-serif |
| Monospace | JetBrains Mono, monospace |

### Spacing
| Token | Value |
|---|---|
| Page horizontal padding | `32px` |
| Card gap | `12px` |
| Card border-radius | `10px` |
| Top bar height | `56px` |
| Sidebar width | `180px` |

### Light Theme Palette
| Token | Value |
|---|---|
| Page background | `#f5f5f0` |
| Surface (cards, bars) | `#ffffff` |
| Border | `#e8e8e2` |
| Accent (primary green) | `#00b894` |
| Danger (delete) | `#e84040` |
| Text primary | `#222222` |
| Text secondary | `#888888` |
| Text dim | `#aaaaaa` |

### Dark Theme Palette
| Token | Value |
|---|---|
| Page background | `#0f1014` |
| Surface | `#16171c` |
| Border | `#22242c` |
| Accent (primary teal) | `#00c9a7` |
| Danger (delete) | `#c0392b` |
| Text primary | `#e8eaf2` |
| Text secondary | `#4a4d5a` |
| Text dim | `#333644` |

---

## Interactions & Behavior

### Accordion expand/collapse
- Clicking anywhere on the card header row (except the checkbox) expands/collapses the file list
- Chevron rotates 180° when expanded (`transition: transform 0.2s`)
- File list slides in below (no animation required in MVP; can add `max-height` CSS transition if desired)

### Checkbox selection
- Checking a group adds it to a `selected` set
- When ≥1 groups selected, the "Delete selected" button activates (turns red, becomes clickable)
- Selected cards get accent-colored border + faint shadow ring

### Filter tabs
- Clicking "Exact Match", "Likely Duplicates", or "Versions" filters the list to that match type
- "All Types" shows everything
- Active tab has accent underline + accent text color

### Delete action
- Shows count: "Delete 3 selected"
- Should trigger a confirmation modal before deleting (design for modal not included in this handoff — implement per existing pattern)

### Theme toggle
- Both Light and Dark themes should be available; implement via a toggle button (location at developer's discretion — top bar or sidebar footer recommended)
- Use CSS custom properties or a theme context/provider for clean switching

---

## State

```
type DuplicateGroup = {
  id: string
  type: 'EXACT' | 'LIKELY' | 'VERSION'
  count: number
  reclaim: string        // e.g. "10.3 MB"
  preview: string        // filename to show in collapsed state
  files: {
    name: string
    path: string
    size: string
    modified: string
  }[]
}

// UI state
expanded: Set<string>    // group ids currently expanded
selected: Set<string>    // group ids currently checked
filter: 'ALL' | 'EXACT' | 'LIKELY' | 'VERSION'
theme: 'light' | 'dark'
```

---

## Assets

- **Fonts:** Barlow, Barlow Condensed, JetBrains Mono — load from Google Fonts or bundle locally
- **Icons:** Inline SVGs only (no icon library required). Two icons used:
  - Search: circle + diagonal line (24×24 viewBox)
  - File: document with folded corner (24×24 viewBox)
  - Chevron: simple `M6 9l6 6 6-6` path (24×24 viewBox)

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `README.md` | This document — full implementation spec |
| `Duplicate Results Page.html` | Interactive design reference — Light + Dark variants side by side |

---

## Questions?

Open the `Duplicate Results Page.html` file in a browser to interact with the prototype. All interactions (expand, select, filter) are live.
