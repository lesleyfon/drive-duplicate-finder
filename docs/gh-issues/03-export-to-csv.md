# Spec: Export to CSV

## Summary

Add a one-click button to the results page that downloads the current scan results as a CSV file. Each row represents one file from a duplicate group, with columns for file name, size, folder, confidence level, group key, and a direct link to the file in Drive.

---

## Background & Motivation

Some users — especially in professional contexts — want to audit duplicates in a spreadsheet before committing to any deletions. The scan results are already fully structured in `useScanStore` as `scanResults.duplicateGroups`. Generating a CSV is a pure client-side operation requiring no API calls.

---

## Scope

- A single "Export CSV" button on the results page.
- Exports all duplicate groups visible under the current confidence filter and search query.
- The download is triggered immediately (no modal, no confirmation).
- The file is named `drive-duplicates-<date>.csv`.

---

## Detailed Requirements

### 1. CSV content and column schema

Each row in the CSV represents one **file** within a duplicate group. Groups with multiple files produce multiple rows sharing the same `group_key`.

| Column | Source | Notes |
|--------|--------|-------|
| `group_key` | `DuplicateGroup.key` | Unique identifier for the duplicate group |
| `confidence` | `DuplicateGroup.confidence` | `exact`, `likely`, or `version` |
| `file_name` | `FileRecord.name` | |
| `file_id` | `FileRecord.id` | Drive file ID |
| `mime_type` | `FileRecord.mimeType` | |
| `size_bytes` | `FileRecord.size` | Raw bytes; empty string if `null` |
| `size_human` | formatted | Human-readable via `formatBytes` from `src/lib/formatters.ts` |
| `modified_time` | `FileRecord.modifiedTime` | ISO 8601 string as-is from the API |
| `created_time` | `FileRecord.createdTime` | ISO 8601 string |
| `web_link` | `FileRecord.webViewLink` | Direct Drive link |
| `parent_folder_id` | `FileRecord.parents[0]` | First parent ID; empty if no parents |
| `wasted_bytes` | `DuplicateGroup.totalWastedBytes` | Same value on every row of the group |

Order: rows are ordered by group (same order as the UI — exact first, then likely, then version; within each confidence level by `totalWastedBytes` descending). Within a group, files are in their natural array order.

### 2. CSV formatting rules

- Delimiter: comma (`,`)
- First row: column headers (lowercase, snake_case as listed above)
- String values containing commas, double-quotes, or newlines must be wrapped in double-quotes and any internal double-quotes escaped by doubling (`""`)
- Use `\r\n` line endings (standard CSV per RFC 4180)
- Encoding: UTF-8 with BOM (`﻿`) so Excel opens it correctly without encoding issues

### 3. New utility — `src/lib/exportCsv.ts`

```ts
import type { DuplicateGroup } from "../types/drive";
import { formatBytes } from "./formatters";

export function buildCsvContent(groups: DuplicateGroup[]): string
export function triggerCsvDownload(content: string, filename: string): void
```

`buildCsvContent` iterates over `groups` (in the provided order) and produces the full CSV string.

`triggerCsvDownload` creates a `Blob` with `type: "text/csv;charset=utf-8;"`, prepends the UTF-8 BOM, creates an object URL, programmatically clicks a temporary `<a>` element, and revokes the URL.

```ts
export function triggerCsvDownload(content: string, filename: string): void {
  const bom = "﻿";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 4. Results page integration — `src/routes/results.tsx`

Add an "Export CSV" button in the `DuplicatesView` component, in the action bar alongside the existing filter tabs and sort controls.

**Behaviour:**
- The button is disabled when `filteredGroups` is empty.
- On click: calls `buildCsvContent(filteredGroups)` then `triggerCsvDownload(content, filename)`.
- The filename is: `drive-duplicates-YYYY-MM-DD.csv` where the date is today's date in local time.
- The button exports only the **currently visible groups** (post-filter and post-search), not the entire `scanResults.duplicateGroups`. This matches user expectation — "what I see is what I export".

**Button label:** `EXPORT CSV` (matching the all-caps UI style).

**Button placement:** Top-right of the results header bar, consistent with the app's existing action button positions.

### 5. Accessibility

- The `<a>` element used for download is not appended to the DOM (create, click, discard).
- The button has `type="button"` to prevent form submission.
- Provide a `title` attribute: `"Download duplicate results as CSV"`.

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/exportCsv.ts` | New — `buildCsvContent` and `triggerCsvDownload` |
| `src/routes/results.tsx` | Add "Export CSV" button to `DuplicatesView`; wire to export helpers |

---

## Edge Cases

- `FileRecord.size` is `null` for Google Workspace files — export `""` in `size_bytes` and `""` in `size_human`.
- `FileRecord.parents` is empty — export `""` for `parent_folder_id`.
- File name contains commas or quotes — handled by the CSV escaping rules above.
- Zero groups after filtering — button is disabled, no download triggered.
- Very large exports (thousands of groups) — `Blob` and object URLs handle this fine in modern browsers; no chunking needed.

---

## Out of Scope

- Exporting results from other views (large files, old files, same-folder groups) — these can be added as follow-ups using the same `exportCsv.ts` utilities.
- Server-side export or email delivery.
- Excel (`.xlsx`) format — CSV opens natively in Excel when the BOM is present.
