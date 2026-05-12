# Handoff: Drive Scan Page

## Overview
The Drive Scan page is what the user sees while the app is hashing their Google Drive and finding duplicate file groups. It's a long-running, anxiety-prone moment ("is anything happening? is it safe? what's it doing with my files?") and the design is built to answer all of those questions at a glance: a giant live progress meter, a phase strip showing exactly where the scan is in its lifecycle, live counters, a streaming activity feed, a tail-style log, and a privacy reassurance band.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The task is to **recreate these designs in the existing codebase** (Vite + React + TanStack Router, per the rest of the project) using its established patterns, components, and theme tokens — not to drop the HTML in as-is.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are all locked. Recreate pixel-perfectly using the codebase's existing components and theme tokens. The light/dark theme tokens listed below match the rest of the app.

## Screens / Views

### Drive Scan (single screen, two themes)
- **Purpose**: Show real-time progress of the duplicate scan; reassure the user the operation is local, safe, and resumable.
- **Route**: `/scan` (NO SIDE BAR ITEM)
- **Layout**: Existing app shell — 180px sidebar on the left (sidebar is rendered at 60% opacity on this page because it's not navigable mid-scan), main content area on the right with a sticky header and a centered max-width 1100px content column.

#### Header (sticky top of main column)
- Background `--surface`, bottom border `1px solid --border`.
- Padding `24px 36px 18px`.
- Breadcrumb row: `Cleanup / Scan` — uppercase, 10px, weight 700, letter-spacing 0.14em. "Cleanup" in `--meta-text`, slash in `--dim-text`, "Scan" in `--accent`.
- Title row (flex, end-aligned, space-between):
  - **H1**: "Drive Scan" + a **LIVE pill**. H1 is Barlow Condensed 900, 42px, line-height 0.95, letter-spacing -0.01em, uppercase, color `--title-text`. The H1 must use `white-space: nowrap` and be a flex container with `gap: 14px` so the pill sits inline.
  - **LIVE pill**: 11px, weight 800, uppercase, letter-spacing 0.16em, color `--accent`, background `--accent-dim`, border `1px solid --accent-border`, padding `4px 10px`, fully-rounded (`border-radius: 99px`). Contains a 6×6 pulsing accent dot (`pulse 1.4s ease-in-out infinite`) followed by the word LIVE.
  - **Subtitle row** (below H1): "Scanning your Google Drive · Started 14 seconds ago" — 11px, weight 600, color `--meta-text`, with an 8×8 pulsing accent dot at the start.
  - **Right-aligned meta** (JetBrains Mono, 11px, color `--meta-text`): two lines — `SESSION scn_a4f9e2` and `ETA ~22s remaining` (the values colored `--body-text` / `--accent` respectively).

#### Content column (max-width 1100px, padding 28px 36px 40px, vertical gap 18px)

##### 1. Hero progress panel
- Card: `--surface`, `1px solid --border`, radius 12, shadow `--card-shadow`, overflow hidden.
- A 1px scan-line at the very top: linear-gradient `(90deg, transparent, --accent, transparent)`, opacity 0.5, animated with `pulse 2s`.
- Inner padding `32px 36px 30px`.
- Two-column row (1fr / auto, end-aligned):
  - **Left column**:
    - Eyebrow: "Step 3 of 5 · Computing checksums" — 10px, weight 800, color `--accent`, letter-spacing 0.18em, uppercase.
    - Big number: `{progress}%` — 96px Barlow Condensed 900, line-height 0.85, letter-spacing -0.025em, color `--title-text`. The `%` glyph is 48px and color `--meta-text`.
    - Inline meta (next to number, baseline aligned): "scanned" (14px weight 700) and "{parsed.toLocaleString()} of ~4,580 objects" (11px JetBrains Mono, `--meta-text`).
  - **Right column**: **Cancel scan** button — `--btn-secondary-*` tokens, 10px 18px, radius 7, 11px Barlow Condensed 700 uppercase letter-spacing 0.1em, with a 11×11 stroked square icon at left.
- **Segmented progress bar**: flex row of 40 segments, 3px gap, 10px tall.
  - Filled segments: `--accent` (full opacity).
  - The 6 most-recent filled segments (the "leading edge"): same color but with `pulse 1s ease-in-out infinite` to read as active.
  - Unfilled segments: `--bar-track`.
  - Each segment radius 1.
- Tick row below: 0 / 25% / 50% / 75% / 100% — JetBrains Mono 9px, `--dim-text`, weight 600, letter-spacing 0.1em.

##### 2. Phase strip (inside the same card, below progress)
- Top border `1px solid --border`, background `--surface-alt`, 5 equal columns.
- Phases (in order): `Connect to Drive ~2s`, `List file metadata ~5s`, `Compute checksums ~30s`, `Find duplicate groups ~5s`, `Prepare results ~1s`.
- Each cell: padding `14px 18px`, right border `1px solid --border` (except last).
- Cell content (vertical gap 4):
  - Row with: 18×18 numbered circle + label.
    - Circle border `1.5px solid` in current state's color.
    - **Past** phases: filled circle in `--body-text`, white check inside.
    - **Current** phase: hollow circle in `--accent`, with a 6×6 pulsing accent dot inside.
    - **Future** phases: hollow circle in `--dim-text`, number 1–5 inside (JetBrains Mono 9px, weight 800).
  - Label: 11px Barlow Condensed 700 uppercase, color matches state.
  - Time tag below (left-padded 25px to align with label): 9px JetBrains Mono `--meta-text`.
- The current phase cell additionally has a 2px-tall `--accent` bar at the very top edge, full-width.

##### 3. Stats grid (4 columns, 14px gap)
Each card: `--surface`, `1px solid --border`, radius 10, padding `18px 20px`, shadow `--card-shadow`.
- Label (top): 9px weight 800, `--meta-text`, letter-spacing 0.14em, uppercase, margin-bottom 8.
- Value: 32px Barlow Condensed 900, letter-spacing -0.01em, line-height 1, margin-bottom 5.
- Sub: 10px JetBrains Mono, `--dim-text`.

The four stats:
1. **Objects parsed** — value `{parsed}` color `--title-text`, sub `of ~4,580`.
2. **Matches found** — value `{matched}` color `--accent`, sub `{exact} exact · {likely} likely`.
3. **Estimated reclaim** — value `{reclaim} MB` color `--amber`, sub `so far`.
4. **Throughput** — value `142/s` color `--body-text`, sub `avg over last 5s`.



##### 4. Privacy reassurance band
- Background `--accent-dim`, border `1px solid --accent-border`, radius 8, padding `12px 18px`.
- Flex row, 14px gap, vertically centered.
- Lock icon (left, 18×18, stroked, color `--accent`).
- Text block (flex 1):
  - Headline: 12px weight 700 `--accent`, "Your files never leave your browser."
  - Sub: 11px `--body-text`, "The scan runs locally. We compute checksums in your browser and send nothing to a server. You can close this tab anytime — there's nothing to clean up."
- Right tag: 9px JetBrains Mono `--meta-text` letter-spacing 0.1em, "0 BYTES SENT".

##### 5. Footer tips (3 columns, 14px gap)
Each card: `--surface`, `1px solid --border`, radius 8, padding `12px 16px`. Title 11px weight 700 `--title-text`, body 11px `--meta-text` line-height 1.5.
1. **Safe to leave** — "The scan continues if you switch tabs. Come back any time."
2. **Resumable** — "If the connection drops, the scan picks up from the last hashed file."
3. **No deletions yet** — "Nothing is modified during the scan. Reviewing comes next."

#### Background grid
The main content area has a faint 32px×32px CSS grid as a background pattern: two layered linear-gradients at 1px using `--grid` color, behind all card content. Implement with `background-image` on the scroll container, NOT on individual cards.

## Interactions & Behavior

### Live counters
- **progress** ticks up by ~0.6 every 320ms, capped at 100.
- **parsed** increments by `2 + random(0..7)` every 320ms.
- **matched** increments by 1 about 30% of ticks.
- **reclaim** increments by `1 + random(0..4)` MB about 50% of ticks.
- These are placeholders. In production, these values come from the scanner worker via postMessage events; the UI just subscribes and renders.

### Activity feed
- Newest item prepends at index 0; older items shift down and dim (opacity = `max(0.25, 1 - i*0.07)`).
- Cap at ~12 visible rows; overflow is hidden.

### Phase strip
- Phase index is driven by the scanner's emitted phase. As scanner advances, the previous phase animates from "current" to "past" (filled circle, check icon).
- Past/current/future styling rules above must update reactively.

### Cancel button
- Confirms with a small dialog: "Cancel the scan? You'll lose progress and need to start over." → terminates the worker, clears local scan state, navigates back to `/cleanup`.

### Animations
- `@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`
- `@keyframes blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }`
- All durations between 1s and 2s; ease-in-out.
- Respect `prefers-reduced-motion: reduce` — disable all the pulsing/blinking animations and replace with static accent fills.

### Resilience
- If the page is hidden (tab backgrounded), the worker keeps running. When the user returns, repaint with the latest values from the worker's last reported state.
- If the websocket / worker dies, show a non-blocking toast in the lower-right with a "Resume" button.

## State Management
At minimum:
- `scanState: 'connecting' | 'listing' | 'hashing' | 'grouping' | 'preparing' | 'done' | 'cancelled' | 'error'`
- `progress: number` (0–100)
- `parsedCount: number`
- `totalCount: number` (estimate — refines after listing phase completes)
- `matchedCount: number`, `exactCount: number`, `likelyCount: number`
- `reclaimMB: number`
- `throughputPerSecond: number`
- `feedEvents: ActivityEvent[]` (capped to ~50; render last 12)
- `logLines: LogLine[]` (capped to ~200; render last ~12 visible in the terminal)
- `sessionId: string` (generated on scan start)
- `startedAt: number` (epoch ms)

The scanner runs as a Web Worker (or shared worker for cross-tab). The scan page subscribes to its messages; the worker is the source of truth, the UI is purely a view.

## Design Tokens

### Light theme (`themeName === "light"`)
| Token | Value |
|---|---|
| `--page-bg` | `#f5f5f0` |
| `--surface` | `#ffffff` |
| `--surface-alt` | `#fafaf8` |
| `--border` | `#e8e8e2` |
| `--border-soft` | `#f0f0ec` |
| `--title-text` | `#111111` |
| `--body-text` | `#333333` |
| `--meta-text` | `#888888` |
| `--dim-text` | `#aaaaaa` |
| `--accent` | `#00b894` |
| `--accent-dim` | `rgba(0,184,148,0.08)` |
| `--accent-border` | `rgba(0,184,148,0.25)` |
| `--amber` | `#f5a623` |
| `--danger` | `#e84040` |
| `--card-shadow` | `0 1px 4px rgba(0,0,0,0.06)` |
| `--btn-bg` | `#111111` |
| `--btn-text` | `#ffffff` |
| `--btn-secondary-bg` | `#ffffff` |
| `--btn-secondary-text` | `#666666` |
| `--btn-secondary-border` | `#e0e0d8` |
| `--bar-track` | `#e8e8e2` |
| `--grid` | `rgba(0,0,0,0.035)` |
| `--terminal-bg` | `#0e0f12` |
| `--terminal-text` | `#9aa0aa` |

### Dark theme (`themeName === "dark"`)
| Token | Value |
|---|---|
| `--page-bg` | `#0a0b0f` |
| `--surface` | `#13141a` |
| `--surface-alt` | `#16171c` |
| `--border` | `#22242c` |
| `--border-soft` | `#1a1c22` |
| `--title-text` | `#e8eaf2` |
| `--body-text` | `#c8cad4` |
| `--meta-text` | `#6a6d7a` |
| `--dim-text` | `#3a3d4a` |
| `--accent` | `#00c9a7` |
| `--accent-dim` | `rgba(0,201,167,0.08)` |
| `--accent-border` | `rgba(0,201,167,0.22)` |
| `--amber` | `#f5a623` |
| `--danger` | `#e84040` |
| `--card-shadow` | `0 1px 6px rgba(0,0,0,0.3)` |
| `--btn-bg` | `#00c9a7` |
| `--btn-text` | `#0a1a16` |
| `--btn-secondary-bg` | `transparent` |
| `--btn-secondary-text` | `#9a9daa` |
| `--btn-secondary-border` | `#2a2d38` |
| `--bar-track` | `#22242c` |
| `--grid` | `rgba(255,255,255,0.025)` |
| `--terminal-bg` | `#06070a` |
| `--terminal-text` | `#7a808a` |

### Typography
- **Display / titles**: `'Barlow Condensed', sans-serif` — weights 700, 800, 900. Used for H1, sidebar logo, big stat numbers, button labels.
- **UI / body**: `'Barlow', sans-serif` — weights 400, 500, 600, 700. Used for body copy, labels.
- **Mono / data**: `'JetBrains Mono', monospace` — weights 400, 500. Used for filenames, paths, timestamps, IDs, log lines, tick marks.

### Spacing
- Card-to-card vertical gap inside main column: `18px`.
- Card padding (standard): `18px 20px` to `32px 36px 30px` depending on hierarchy.
- Inner element gaps: `4`, `6`, `8`, `10`, `14`, `18`, `30`, `36`.

### Radii
- Small chips/badges: `3`
- Inline buttons: `7`
- Cards: `8`, `10`, `12`
- Pills: `99` (fully rounded)

## Assets
- **Fonts**: Google Fonts — Barlow, Barlow Condensed, JetBrains Mono. Already loaded in the rest of the app.
- **Icons**: All inline SVG (lock, square outline). Use the codebase's existing icon system if one exists (Lucide, Heroicons, etc.) — match `stroke-width: 2` and the existing icon sizing scale.
- No raster images.

## Files in this bundle
- `Scan Page.html` — interactive HTML prototype with both light and dark themes side-by-side on a design canvas. Open this in a browser to see the live counters, animations, and interactions.
- `design-canvas.jsx` — the canvas component that hosts the two artboards. Not part of the production design — it's just the framing wrapper.
- `README.md` — this file.

## Implementation notes for the developer
1. The current production scan page (per the user's screenshot) is a single centered "SCAN IN PROGRESS" bar with an Objects Parsed counter and a Cancel button. This redesign is a complete replacement — the centered minimalism reads as "is anything happening?" during the long checksum phase. The new design is dense by design: every chunk of UI answers a different question the user is silently asking.
2. Use the existing app shell (sidebar + breadcrumb header pattern) — don't recreate. The sidebar IS rendered slightly dimmed (60% opacity) on this page because the user can't navigate away mid-scan; consider implementing this with a `pointer-events: none` overlay rather than mutating the sidebar component.
3. The **terminal log** is a deliberately "developer-energy" element — it tells power users the tool is doing real work and grounds the privacy claim. Don't drop it for being too technical; it's load-bearing for the brand.
4. Keep the **accent color** firmly tied to "this is happening right now" semantics: progress bar fill, LIVE pill, current phase, scan-line, match badges, primary CTAs. Don't dilute it.
5. The page is **not responsive below ~1100px**. Below that, collapse the two-column row into stacked, and the 4-col stats grid into 2×2. Mobile is out of scope for v1.
