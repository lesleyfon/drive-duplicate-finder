# DASHBOARD_SPEC.md — Storage Summary Dashboard

> **Purpose:** Full spec for the `/dashboard` route content area, based on the DRIVE_CLEAN_SYSTEM mockup. Covers layout, all new components, data sources, and states. Apply on top of `UPDATED_THEME.md`. The sidebar/nav is handled separately — this doc covers only the main content panel.

---

## 1. Layout Overview

The dashboard content area is a scrollable column of two stacked sections:

```
┌──────────────────────────────────────────────────────────┐
│  SECTION 1 — SYSTEM_STORAGE_OVERVIEW                     │
│  (large GB readout + ALLOCATION DISTRIBUTION bar + stats)│
├──────────────────────────────────────────────────────────┤
│  SECTION 2 — Middle row (2 columns)                      │
│   ┌──────────────────────┐  ┌─────────────────────────┐ │
│   │  QUICK_SCAN_V2       │  │  RECENT_FILE_ACTIVITY   │ │
│   │  (scan launcher)     │  │  (live feed)            │ │
│   └──────────────────────┘  └─────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

Section 1 and the right panel of Section 2 show pre-scan placeholder states when no scan has been run. The left panel (scan launcher) is always fully interactive.

---

## 2. Data Sources

| Widget | Source | Hook / Cache key |
|---|---|---|
| Total storage used / limit | Drive `about` endpoint | `useStorageQuota()` → `['storageQuota']` |
| CAPACITY % | Derived: `used / limit * 100` | Same |
| STATE badge | Derived from capacity % | Same |
| Allocation bar + stats (IMG/VID/AUD/DOC) | `ScanResult.fileGroupBytes` | `['scanResults']` |
| RECENT_FILE_ACTIVITY | `ScanResult.recentFiles` (top 8 by `modifiedTime` from all files, including Google Docs) | `['scanResults']` |

### 2.1 Extended `ScanResult` Interface

Add these fields to the existing `ScanResult` in `src/types/drive.ts`:

```ts
interface ScanResult {
  // --- existing ---
  totalFilesScanned: number
  excludedFiles: number
  duplicateGroups: DuplicateGroup[]
  scannedAt: Date

  // --- new fields ---
  fileGroupBytes: {
    image:    number   // total bytes of all image/* files
    video:    number   // total bytes of all video/* files
    audio:    number   // total bytes of all audio/* files
    document: number   // total bytes of pdf, doc, text files
    other:    number   // everything else
  }
  recentFiles: RecentFileEntry[]  // top 8 files by modifiedTime desc
}

interface RecentFileEntry {
  id:           string
  name:         string
  mimeType:     string
  size:         number
  modifiedTime: string   // ISO 8601
  webViewLink:  string
}
```

Update `src/lib/deduplicator.ts` to compute `fileGroupBytes` and `recentFiles` from the full file list before returning the `ScanResult`.

---

## 3. Section 1 — SYSTEM_STORAGE_OVERVIEW

### 3.1 Outer Container

```tsx
<section className="px-8 py-6 border-b border-border-dim">
  {/* Section label */}
  <div className="flex items-center gap-2 mb-5">
    <span className="w-2 h-2 bg-cyan-bright flex-shrink-0" />
    <p className="text-label uppercase tracking-widest text-text-muted">
      SYSTEM_STORAGE_OVERVIEW
    </p>
  </div>

  {/* GB readout row */}
  {/* Allocation bar */}
  {/* Stats row */}
</section>
```

### 3.2 GB Readout Row

```tsx
<div className="flex items-end justify-between mb-6">
  {/* Left — large number */}
  <div className="flex items-baseline gap-3">
    <span className="text-[56px] font-bold leading-none tracking-tight text-text-primary">
      {usedGb.toFixed(2)}
    </span>
    <span className="text-[28px] font-normal text-text-muted leading-none">
      /{totalGb.toFixed(1)}
    </span>
    <span className="text-[28px] font-bold text-text-primary leading-none ml-1">GB</span>

    {/* CAPACITY badge */}
    <span className="px-3 py-1 border border-cyan-dim text-cyan-bright text-label uppercase tracking-widest ml-2">
      CAPACITY: {capacityPct.toFixed(1)}%
    </span>
  </div>

  {/* Right — STATE badge */}
  <span className="text-label uppercase tracking-widest text-text-muted">
    STATE:{' '}
    <span className={stateColor}>
      [{stateLabel}]
    </span>
  </span>
</div>
```

**STATE label logic** (derive from `capacityPct`):

| Capacity | `stateLabel` | `stateColor` |
|---|---|---|
| < 60% | `OPTIMAL` | `text-status-ok` (cyan) |
| 60–80% | `MODERATE` | `text-status-warn` (amber) |
| > 80% | `CRITICAL` | `text-status-error` (salmon) |

### 3.3 ALLOCATION DISTRIBUTION Bar

A full-width segmented bar. Each segment is proportional to its bucket's share of `fileGroupBytes` total. Segments are labelled inline with short caps (IMG, VID, AUD, DOC).

```tsx
<div className="mb-4">
  <p className="text-label uppercase tracking-widest text-text-muted mb-2">
    ALLOCATION DISTRIBUTION
  </p>

  {/* Segmented bar */}
  <div className="flex h-10 w-full overflow-hidden border border-border-dim">
    {segments.map(seg => (
      <div
        key={seg.key}
        style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
        className="flex items-center justify-center flex-shrink-0 transition-all"
      >
        {seg.pct > 5 && (
          <span className="text-label uppercase tracking-widest text-ink font-semibold">
            {seg.shortLabel}
          </span>
        )}
      </div>
    ))}
    {/* Remainder (unused space) */}
    <div className="flex-1 bg-surface-high" />
  </div>
</div>
```

**Segment definitions** (fixed order, fixed colors):

```ts
const ALLOCATION_SEGMENTS = [
  { key: 'image',    shortLabel: 'IMG', color: '#00F0FF' },   // Electric Cyan
  { key: 'video',    shortLabel: 'VID', color: '#00DBE9' },   // Cyan Dim
  { key: 'audio',    shortLabel: 'AUD', color: '#007981' },   // Teal mid
  { key: 'document', shortLabel: 'DOC', color: '#3B494B' },   // Dark teal border
  { key: 'other',    shortLabel: 'OTH', color: '#2A2A2A' },   // Surface high
]
```

**Width calculation:** `pct = (bytes / totalStorageUsed) * 100` where `totalStorageUsed` comes from `useStorageQuota`. This places the allocation in the context of the whole drive, not just scanned files.

### 3.4 Stats Row

Four columns below the bar, each with a left-side colored vertical rule and two lines of text:

```tsx
<div className="grid grid-cols-4 divide-x divide-border-dim mt-4">
  {segments.slice(0, 4).map(seg => (
    <div key={seg.key} className="flex items-start gap-3 px-5 first:pl-0">
      {/* Colored left bar */}
      <div className="w-0.5 h-full self-stretch flex-shrink-0" style={{ backgroundColor: seg.color }} />
      <div>
        <p className="text-label uppercase tracking-widest text-text-muted mb-1">
          {seg.fullLabel}  {/* IMAGES, VIDEOS, AUDIO, DOCS */}
        </p>
        <p className="text-[22px] font-bold leading-none text-text-primary">
          {formatBytes(fileGroupBytes[seg.key])}  {/* e.g. "2.59 GB" */}
        </p>
      </div>
    </div>
  ))}
</div>
```

**`seg.fullLabel` values:** IMAGES, VIDEOS, AUDIO, DOCS

---

## 4. Section 2 — Middle Row (Two Columns)

```tsx
<section className="px-8 py-6 border-b border-border-dim">
  <div className="grid grid-cols-[1fr_1.1fr] gap-4">
    <QuickScanCard />
    <RecentFileActivity />
  </div>
</section>
```

The right panel is slightly wider than the left (`grid-cols-[1fr_1.1fr]`) to give the activity feed more room.

---

## 5. QUICK_SCAN_V2 Card

Create `src/components/QuickScanCard.tsx`.

```tsx
<div className="border border-border-dim bg-surface-low flex flex-col h-full">
  {/* Header */}
  <div className="px-5 pt-5 pb-4 flex items-start justify-between">
    <div>
      <h2 className="text-nav uppercase tracking-widest text-cyan-bright mb-2">
        QUICK_SCAN_V2
      </h2>
      <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
        LOCATE DUPLICATE ASSETS, TEMPORARY DATA STRUCTURES, AND
        ABANDONED CLUSTERS IN &lt;0.4S.
      </p>
    </div>
    {/* Icon — magnifier with chart bars, top-right */}
    <ScanLine className="w-10 h-10 text-border-bright flex-shrink-0 ml-4 mt-1" />
  </div>

  {/* Spacer — pushes button to bottom */}
  <div className="flex-1" />

  {/* If scan already run: show last scan meta */}
  {scanResults && (
    <div className="px-5 pb-3">
      <p className="text-label uppercase tracking-widest text-text-muted">
        LAST_SCAN:{' '}
        <span className="text-text-secondary">{formatDate(scanResults.scannedAt.toISOString())}</span>
        {' · '}
        <span className="text-text-secondary">
          {scanResults.totalFilesScanned.toLocaleString()} OBJECTS
        </span>
      </p>
    </div>
  )}

  {/* Execute button */}
  <div className="px-5 pb-5">
    <button
      onClick={handleStartScan}
      className="w-full py-3 border border-cyan-bright text-cyan-bright text-label uppercase tracking-widest font-semibold
                 hover:bg-cyan-bright hover:text-ink transition-colors flex items-center justify-center gap-2"
    >
      <ScanLine size={14} />
      {scanResults ? 'RE-EXECUTE_SCAN' : 'EXECUTE_SCAN'}
    </button>
  </div>
</div>
```

> Note: The EXECUTE_SCAN button uses an **outlined** style (border + cyan text), not the filled cyan primary style, matching the mockup. On hover it inverts to filled.

---

## 6. RECENT_FILE_ACTIVITY Panel

Create `src/components/RecentFileActivity.tsx`.

Shows the 8 most recently modified files from the last scan, as a dense terminal-style list. This is always read-only — no checkboxes.

```tsx
<div className="border border-border-dim bg-surface-low flex flex-col">
  {/* Header */}
  <div className="px-5 py-3 border-b border-border-dim flex items-center justify-between">
    <p className="text-nav uppercase tracking-widest text-text-primary">
      RECENT_FILE_ACTIVITY
    </p>
    <span className="px-2 py-0.5 border border-status-ok text-status-ok text-label uppercase tracking-widest">
      LIVE_FEED
    </span>
  </div>

  {/* File rows */}
  <div className="flex flex-col divide-y divide-border-dim">
    {recentFiles.map(file => (
      <RecentFileRow key={file.id} file={file} />
    ))}
  </div>
</div>
```

### 6.1 `RecentFileRow` Sub-component

```tsx
<a
  href={file.webViewLink}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-3 px-5 py-3 hover:bg-surface-high transition-colors group"
>
  {/* Timestamp */}
  <span className="text-label text-text-muted flex-shrink-0 w-16 font-mono">
    {formatTime(file.modifiedTime)}  {/* HH:MM:SS */}
  </span>

  {/* File type color square */}
  <span
    className="w-3 h-3 flex-shrink-0"
    style={{ backgroundColor: getMimeColor(file.mimeType) }}
  />

  {/* Filename */}
  <span className="text-sm text-text-secondary truncate flex-1 group-hover:text-text-primary transition-colors">
    {file.name}
  </span>

  {/* Size */}
  <span className="text-sm text-text-muted flex-shrink-0 text-right w-16">
    {formatBytes(file.size)}
  </span>
</a>
```

### 6.2 `getMimeColor` Helper

Add to `src/lib/formatters.ts`:

```ts
export function getMimeColor(mimeType: string): string {
  if (mimeType.startsWith('image/'))         return '#00F0FF'  // cyan
  if (mimeType.startsWith('video/'))         return '#00DBE9'  // cyan dim
  if (mimeType.startsWith('audio/'))         return '#7AD4DD'  // secondary cyan
  if (mimeType === 'application/pdf')        return '#4A9EFF'  // blue
  if (mimeType.startsWith('text/'))          return '#B9CACB'  // text secondary
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gzip'))
                                             return '#849495'  // dim grey
  return '#3B494B'                                             // dark teal
}
```

### 6.3 Pre-scan State

When `scanResults` is null, show 8 placeholder rows:

```tsx
{Array.from({ length: 8 }).map((_, i) => (
  <div key={i} className="flex items-center gap-3 px-5 py-3 opacity-20">
    <div className="w-16 h-3 bg-surface-top" />
    <div className="w-3 h-3 bg-surface-top" />
    <div className="flex-1 h-3 bg-surface-top" />
    <div className="w-16 h-3 bg-surface-top" />
  </div>
))}
```

---

## 7. Pre-scan & Loading States Summary

| Widget | Pre-scan state | Loading (scan in progress) |
|---|---|---|
| GB readout | Shows live data from `useStorageQuota` (available without scan) | Same |
| CAPACITY badge | Live | Same |
| Allocation bar | Empty grey bar, full width, `opacity-30` | Pulse animate |
| Stats row | All values show `—` | Pulse animate |
| QUICK_SCAN_V2 | Fully interactive, shows `EXECUTE_SCAN` | Button disabled, shows `SCANNING...` |
| RECENT_FILE_ACTIVITY | 8 skeleton rows | 8 skeleton rows |

---

## 8. File Checklist for Claude Code

| File | Action |
|---|---|
| `src/types/drive.ts` | Add `fileGroupBytes`, `recentFiles: RecentFileEntry[]`, new `RecentFileEntry` interface |
| `src/lib/deduplicator.ts` | Compute `fileGroupBytes` and `recentFiles` (top 8 by `modifiedTime` from `allFiles`) |
| `src/lib/formatters.ts` | Add `getMimeColor(mimeType)` helper and `formatTime(iso)` helper (returns `HH:MM:SS`) |
| `src/routes/dashboard.tsx` | Replace current content with Sections 1–2 layout; consume `useStorageQuota` and `scanResults` |
| `src/components/QuickScanCard.tsx` | Create (Section 5) |
| `src/components/RecentFileActivity.tsx` | Create (Section 6) |

Do **not** modify auth, routing, the Drive API layer, or the deduplication algorithm logic. Changes are confined to dashboard UI, new components, `deduplicator.ts` output fields, and the new scan log context.
