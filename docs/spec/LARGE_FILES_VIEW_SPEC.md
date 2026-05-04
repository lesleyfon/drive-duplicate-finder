# Design Spec — Large Files View
_Handoff spec for Claude Code. Implement pixel-precisely from this document._

---

## 1. Overview

This document specifies the **Large Files** view — one of the "Files by Category" screens accessible from the left sidebar. It shows the user's 20 largest Google Drive files ranked by size, with a visual bar chart column, type-color coding, and a bulk-delete action.

The view ships in **Light** and **Dark** themes using the existing token system defined in `RESULT_PAGE_REDESIGN.md`. Colors are expressed as CSS variable references (`var(--theme-xxx)`). Where new tokens are introduced they are marked **NEW TOKEN**.

---

## 2. Layout

Identical to the rest of the app — **left sidebar + main content area**, full viewport height, no page scroll on the outer shell.

```
┌─────────────────┬──────────────────────────────────────────────────┐
│  Sidebar 180px  │  Main content (flex: 1, overflow-y: auto)        │
│                 │  ┌──────────────────────────────────────────────┐ │
│  [Logo]         │  │  Page Header (title + stats + action)        │ │
│                 │  ├──────────────────────────────────────────────┤ │
│  FILES BY       │  │  Sort/Filter Bar + Search                    │ │
│  CATEGORY       │  ├──────────────────────────────────────────────┤ │
│  > Duplicates   │  │  Table Header Row                            │ │
│  > Same Folder  │  ├──────────────────────────────────────────────┤ │
│  > Hidden       │  │  File Row × N (scrollable)                   │ │
│  > Empty        │  │  ...                                         │ │
│  > LARGE ←active│  └──────────────────────────────────────────────┘ │
│  > Old          │                                                   │
│  > Not Owned    │                                                   │
│  > Type         │                                                   │
│  > All Files    │                                                   │
│                 │                                                   │
│  [Footer links] │                                                   │
└─────────────────┴──────────────────────────────────────────────────┘
```

---

## 3. Sidebar

Reuse the sidebar component from `RESULT_PAGE_REDESIGN.md` exactly. The only difference is the active nav item: **LARGE** is highlighted instead of DUPLICATES.

| Property | Value |
|---|---|
| Width | `180px` |
| Background | `var(--theme-surface)` |
| Right border | `1px solid var(--theme-sidebar-border)` |

**Logo block** (`padding: 20px 18px 14px`):
- App name: "DRIVE / DUPLICATE / CLEANER" — three lines, font `Barlow Condensed`, weight `900`, size `18px`, line-height `1.1`, uppercase, color `var(--theme-accent)`
- Subtitle: "DRIVE SCANNER V1" — font-size `8px`, weight `700`, letter-spacing `0.1em`, color `var(--theme-sidebar-text)`, margin-top `6px`

**Section label "FILES BY CATEGORY"** (`padding: 16px 18px 4px`):
- Font-size `9px`, weight `700`, letter-spacing `0.08em`, uppercase, color `var(--theme-date-text)`

**Nav items** (`padding: 5px 18px`, font-size `9px`, letter-spacing `0.06em`, uppercase, font `Barlow Condensed`):
- **Active item (LARGE)**: weight `700`, color `var(--theme-sidebar-active)`, background `var(--theme-sidebar-active-bg)`
- **Inactive items**: weight `500`, color `var(--theme-sidebar-text)`
- Hover: background `var(--theme-sidebar-active-bg)`, color `var(--theme-sidebar-active)`

Nav item order: DUPLICATES, SAME FOLDER, HIDDEN, EMPTY, LARGE, OLD, NOT OWNED BY ME, TYPE, ALL FILES

**Footer links** (bottom, separated by `1px solid var(--theme-sidebar-border)` divider):
- Items: STORAGE ANALYZER, BROWSE GROUPS, LOG OUT
- Font-size `9px`, weight `700`, letter-spacing `0.06em`, uppercase
- Color `var(--theme-sidebar-text)`
- Prefix icons: `©` before STORAGE ANALYZER, `≡` before BROWSE GROUPS, `↗` before LOG OUT (or Lucide `BarChart2`, `Layers`, `LogOut` at 10px)
- `padding: 12px 18px`, gap `2px` between items

---

## 4. Page Header

Sits at the top of the main content area. No outer padding on the page itself — the header is flush to the top edge.

```
┌────────────────────────────────────────────────────────────────────────┐
│  [bar-chart icon]  LARGE FILES          20 files shown  24.2 GB combined  [DELETE SELECTED]  │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Structure

`display: flex`, `align-items: center`, `justify-content: space-between`, `padding: 14px 24px`, `border-bottom: 1px solid var(--theme-border)`

**Left side — title group** (`display: flex`, `align-items: center`, `gap: 10px`):
- **Icon**: bar chart / `BarChart2` from Lucide, size `18px`, color `var(--theme-accent)`
- **Title text**: "LARGE FILES", font `Barlow Condensed`, weight `800`, size `20px`, uppercase, letter-spacing `0.04em`, color `var(--theme-sidebar-active)`

**Center/right stats group** (`display: flex`, `align-items: center`, `gap: 18px`):
- "20 files shown" — font-size `12px`, weight `500`, color `var(--theme-text-secondary)`
- Separator pipe `|` — color `var(--theme-border)`
- "24.2 GB" — font-size `14px`, weight `700`, color `var(--theme-large-file-size)` (**NEW TOKEN** — `#f59e0b` both themes, see Section 15)
- " combined" — font-size `12px`, weight `500`, color `var(--theme-text-secondary)` (directly after the amber number, no pipe)

**Action button — DELETE SELECTED** (disabled state by default until rows are checked):
- `padding: 7px 16px`
- Background: `var(--theme-delete-btn-bg)` (disabled grey)
- Text: "DELETE SELECTED", font `Barlow Condensed`, weight `700`, size `11px`, letter-spacing `0.08em`, uppercase
- Color: `var(--theme-delete-btn-text)` (muted, disabled)
- Border: `none`
- Border-radius: `4px`
- **Enabled state** (when ≥1 row checked): background `var(--theme-delete-btn-active-bg)`, text color `var(--theme-delete-btn-active-text)`, cursor `pointer`

---

## 5. Sort / Filter Bar

Directly below the page header, full width.

`display: flex`, `align-items: center`, `justify-content: space-between`, `padding: 0 24px`, `border-bottom: 1px solid var(--theme-border)`, height `40px`

**Left — Sort tabs** (`display: flex`, `gap: 0`, `align-items: stretch`):

Each tab: `padding: 0 16px`, `height: 40px`, `display: flex`, `align-items: center`, font `Barlow Condensed`, weight `700`, font-size `11px`, letter-spacing `0.08em`, uppercase, cursor `pointer`

| State | Text color | Bottom border |
|---|---|---|
| Active (FILE SIZE) | `var(--theme-sidebar-active)` | `2px solid var(--theme-accent)` |
| Inactive | `var(--theme-filter-inactive)` | none |
| Hover (inactive) | `var(--theme-count-badge-text)` (light) / `var(--theme-filename-text)` (dark) | none |

Tabs in order: FILE SIZE, NAME, DATE MODIFIED

**Label prefix "SORT BY"** (to the left of the tabs, `margin-right: 4px`):
- Font-size `9px`, weight `700`, letter-spacing `0.08em`, uppercase, color `var(--theme-date-text)`

**Right — Search input**:
- Width `200px`, height `28px`
- Background: `var(--theme-search-bg)`
- Border: `1px solid var(--theme-border)`
- Border-radius: `4px`
- Padding: `0 10px 0 28px` (space for search icon on left)
- Placeholder: "Search filename or type...", color `var(--theme-date-text)`, font-size `11px`
- Search icon (Lucide `Search`, 12px) positioned absolute left `9px`, color `var(--theme-date-text)`
- Font-size `11px`, color `var(--theme-body-text)`

---

## 6. Table

### 6.1 Table Header Row

`display: grid` with column template (see Section 6.3), `padding: 6px 24px`, background: `var(--theme-expanded-bg)`, `border-bottom: 1px solid var(--theme-border)`

Column labels: _(blank for checkbox)_ | RANK | TYPE | FILENAME | SIZE | BAR | LOCATION | MODIFIED

All labels: font-size `9px`, weight `700`, letter-spacing `0.08em`, uppercase, color `var(--theme-date-text)`

### 6.2 File Row

Each row: `display: grid` with same column template, `padding: 8px 24px`, `align-items: center`, `border-bottom: 1px solid var(--theme-file-row-border)`

- **Hover**: background `var(--theme-page-bg)` (light) / `var(--theme-surface)` (dark)
- **Selected** (checkbox checked): background `var(--theme-file-sel-bg)`

### 6.3 Column Template

```css
grid-template-columns: 28px 36px 56px 1fr 72px 100px 140px 100px;
```

| Col | Width | Content |
|---|---|---|
| 1 | `28px` | Checkbox |
| 2 | `36px` | Rank badge |
| 3 | `56px` | Type badge |
| 4 | `1fr` | Filename |
| 5 | `72px` | Size value |
| 6 | `100px` | Bar chart |
| 7 | `140px` | Location path |
| 8 | `100px` | Date modified |

---

## 7. Cell Components

### 7.1 Checkbox

`width: 14px`, `height: 14px`, `border: 1px solid var(--theme-border)`, no border-radius, `appearance: none`, cursor `pointer`

**Checked state**: background `var(--theme-accent)`, border-color `var(--theme-accent)`, white checkmark SVG centered

### 7.2 Rank Badge

Format: `#1`, `#2`, etc. — hash symbol + number

- Font `Barlow Condensed`, weight `800`, font-size `13px`
- Color: matches the **type color** of the file in that row (see Section 7.3 color table)
- No background, no border

### 7.3 Type Badge

Pill-shaped label showing file extension in uppercase.

`padding: 2px 6px`, `border-radius: 3px`, font `Barlow Condensed`, weight `700`, font-size `10px`, letter-spacing `0.04em`, uppercase, `display: inline-block`

#### Type color table

| Extension | Badge bg (light) | Badge bg (dark) | Text color |
|---|---|---|---|
| MP4 | `var(--theme-type-video-bg)` | `var(--theme-type-video-bg)` | `var(--theme-type-video-text)` |
| MOV | `var(--theme-type-video-bg)` | `var(--theme-type-video-bg)` | `var(--theme-type-video-text)` |
| DMG | `var(--theme-type-archive-bg)` | `var(--theme-type-archive-bg)` | `var(--theme-type-archive-text)` |
| ZIP | `var(--theme-type-archive-bg)` | `var(--theme-type-archive-bg)` | `var(--theme-type-archive-text)` |
| TAR | `var(--theme-type-archive-bg)` | `var(--theme-type-archive-bg)` | `var(--theme-type-archive-text)` |
| PRPROJ | `var(--theme-same-folder-bg)` | `var(--theme-same-folder-bg)` | `var(--theme-accent)` |
| KEY | `var(--theme-same-folder-bg)` | `var(--theme-same-folder-bg)` | `var(--theme-accent)` |
| LRCAT | `var(--theme-same-folder-bg)` | `var(--theme-same-folder-bg)` | `var(--theme-accent)` |
| VMDK | `var(--theme-count-badge-bg)` | `var(--theme-border)` | `var(--theme-text-secondary)` |
| WAV | `var(--theme-type-audio-bg)` | `var(--theme-type-audio-bg)` | `var(--theme-type-audio-text)` |
| AIFF | `var(--theme-type-audio-bg)` | `var(--theme-type-audio-bg)` | `var(--theme-type-audio-text)` |

For unknown/unlisted extensions: use the VMDK (gray) style.

**NEW TOKENS** required for this table (see Section 15):
- `--theme-type-video-bg` / `--theme-type-video-text`
- `--theme-type-archive-bg` / `--theme-type-archive-text`
- `--theme-type-audio-bg` / `--theme-type-audio-text`
- `--theme-large-file-size`

### 7.4 Filename

- Font-size `13px`, weight `500`, color `var(--theme-text-primary)`
- `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`
- Full filename shown (no path here)

### 7.5 Size Value

- Font `Barlow Condensed`, weight `700`, font-size `13px`
- Color: matches the **type text color** from Section 7.3 (same color as the rank badge and type badge text)
- Right-aligned within its column
- Format: `4.7 GB`, `3.2 GB`, `980 MB`, `287 MB` etc. (1 decimal place for GB, whole number for MB)

### 7.6 Size Bar (BAR column)

A horizontal bar showing the file's size relative to the largest file in the list (#1).

**Track**: `height: 4px`, full column width, background `var(--theme-border)` (light) / `var(--theme-delete-btn-bg)` (dark), `border-radius: 2px`

**Fill**:
- `height: 4px`, `border-radius: 2px`
- Width: `(file_size / max_file_size) * 100%`  — e.g. #1 = 100%, #2 = ~68%, #15 ≈ 6%
- Color: matches the **type text color** from Section 7.3

So `#1 Family_Vacation_Raw_Footage.mp4` → 100% width, `var(--theme-type-video-text)` fill
`#2 MacOS_Ventura_Install.dmg` → ~68% width, `var(--theme-type-archive-text)` fill
etc.

### 7.7 Location

- Truncated Google Drive path, e.g. `PATH/TO/GOOGLE/…`
- Font-size `11px`, color `var(--theme-path-text)`
- `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap`

### 7.8 Date Modified

- Format: `Aug 12, 2023` (month abbreviated, not uppercase)
- Font-size `11px`, color `var(--theme-path-text)`
- Right-aligned

---

## 8. Full File List (reference data)

Use this data to populate the view during development/demo mode.

| # | Type | Filename | Size (bytes) | Location | Modified |
|---|---|---|---|---|---|
| 1 | MP4 | Family_Vacation_Raw_Footage.mp4 | 4,700,000,000 | PATH/TO/GOOGLE/… | Aug 12, 2023 |
| 2 | DMG | MacOS_Ventura_Install.dmg | 3,200,000,000 | PATH/TO/GOOGLE/… | Nov 3, 2023 |
| 3 | ZIP | Project_Archive_2022.zip | 2,100,000,000 | PATH/TO/GOOGLE/… | Jan 18, 2024 |
| 4 | ZIP | Backup_Photos_2021.zip | 1,800,000,000 | PATH/TO/GOOGLE/… | Feb 5, 2023 |
| 5 | MOV | Wedding_Ceremony_Edit_v3.mov | 1,400,000,000 | PATH/TO/GOOGLE/… | Sep 28, 2022 |
| 6 | PRPROJ | Adobe_Premiere_Project.prproj | 980,000,000 | PATH/TO/GOOGLE/… | Oct 14, 2023 |
| 7 | VMDK | VM_Windows11_Snapshot.vmdk | 870,000,000 | PATH/TO/GOOGLE/… | Mar 7, 2024 |
| 8 | TAR | Dataset_Training_Images.tar.gz | 744,000,000 | PATH/TO/GOOGLE/… | Apr 22, 2024 |
| 9 | WAV | Concert_Recording_Master.wav | 612,000,000 | PATH/TO/GOOGLE/… | Jul 1, 2023 |
| 10 | KEY | Company_Pitch_Deck_Final.key | 540,000,000 | PATH/TO/GOOGLE/… | Dec 9, 2023 |
| 11 | LRCAT | Lightroom_Catalog_2023.lrcat | 487,000,000 | PATH/TO/GOOGLE/… | Nov 20, 2023 |
| 12 | MP4 | Screen_Recording_Tutorial.mp4 | 420,000,000 | PATH/TO/GOOGLE/… | Feb 14, 2024 |
| 13 | ZIP | node_modules_backup.zip | 398,000,000 | PATH/TO/GOOGLE/… | Mar 30, 2024 |
| 14 | ZIP | Product_Photos_RAW.zip | 344,000,000 | PATH/TO/GOOGLE/… | Jan 9, 2024 |
| 15 | AIFF | Podcast_Episode_47_Master.aiff | 287,000,000 | PATH/TO/GOOGLE/… | Apr 3, 2024 |

_(List continues to 20 items total. Items #16–20 not visible in the mockup screenshot — extrapolate sizes downward proportionally.)_

The header stat **"24.2 GB combined"** is the sum of all 20 files.

---

## 9. Select-All Behaviour

The checkbox in the table header row selects/deselects all visible rows.

When ≥1 row is checked:
- The **DELETE SELECTED** button transitions from disabled to enabled (red background, white text — see Section 4.1)
- Clicking DELETE SELECTED opens the existing `DeleteModal` / confirmation dialog from the design system

---

## 10. Search Behaviour

Typing in the search input filters the table rows in real time. Match against:
- Filename (partial, case-insensitive)
- File extension / type (e.g. typing "mp4" shows only MP4 rows)

The header stat "20 files shown" updates to reflect the filtered count (e.g. "3 files shown").

The bar widths and rank numbers remain relative to the _original_ full list, not re-normalised to the filtered subset. (Rank #12 stays `#12` even if it's the only MP4 shown after filtering.)

---

## 11. Routing & Navigation

This view is reached via the **LARGE** nav item in the sidebar.

- Route: `/results?filter=large` (consistent with existing filter pattern in the codebase)
- The sidebar's LARGE item shows the active state (bold, highlighted background) when this route is active

---

## 12. Responsive / Overflow

This view is designed for desktop (min-width `960px`). No mobile breakpoints required.

If the main content area is narrower than the table's natural width, the table scrolls horizontally within its container. The sidebar does **not** scroll with the table.

---

## 13. Empty State

If no files meet the "large" threshold (unlikely but handle gracefully):

Center the following message inside the main content area (vertically + horizontally):
- Icon: `HardDrive` from Lucide, `40px`, color `var(--theme-file-icon-color)`
- Heading: "No large files found", font-size `16px`, weight `600`, color `var(--theme-text-secondary)`, margin-top `12px`
- Body: "Files over 100 MB will appear here.", font-size `13px`, color `var(--theme-path-text)`, margin-top `4px`

---

## 14. Theme Toggle

Use the same theme toggle mechanism already present in the app (from `RESULT_PAGE_REDESIGN.md`). No new toggle UI is needed in this view — it is controlled globally.

Dark mode screenshot shows all the same content with the dark token values applied. There are no structural differences between light and dark — only color token swaps.

---

## 15. New Colors Required

### CSS token — `--theme-large-file-size`
Amber used for the "X GB combined" stat in the page header. Theme-invariant. Already added to `src/index.css`.

```css
--theme-large-file-size: #f59e0b; /* same in :root and [data-theme="dark"] */
```

### Component constant — `TYPE_COLORS`
File type badge colors live in the component as a `TYPE_COLORS` constant (consistent with the existing pattern in the codebase). Badge backgrounds differ per theme; text colors are the same in both.

```ts
const TYPE_COLORS: Record<string, { light: string; dark: string; text: string }> = {
  video:   { light: '#fde8e8', dark: '#2d1515', text: '#e53535' }, // MP4, MOV
  archive: { light: '#e8eeff', dark: '#121830', text: '#3b6ef5' }, // DMG, ZIP, TAR
  audio:   { light: '#fff8e6', dark: '#221a08', text: '#d97706' }, // WAV, AIFF
};
```

The green family (PRPROJ, KEY, LRCAT) uses `var(--theme-same-folder-bg)` for background and `var(--theme-accent)` for text — no new values needed.

The grey fallback (VMDK, unknown) uses `var(--theme-count-badge-bg)` / `var(--theme-border)` (dark) for background and `var(--theme-text-secondary)` for text.

> **TODO**: Move `TYPE_COLORS` light/dark bg values into `src/index.css` as `--theme-type-video-bg` etc. once the pattern is proven.
