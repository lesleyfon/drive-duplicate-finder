# Spec: Incremental / Cached Scans

## Summary

Persist the full file list from a completed scan to `localStorage` and, on subsequent scans, only re-fetch files that have changed since the last scan. This makes repeat scans nearly instant for users who scan regularly.

---

## Background & Motivation

The Drive API returns a `modifiedTime` field on every file (already included in the fields mask in `listFilesPage`). After a full scan completes, the entire file list sits in memory — but the store currently persists only the *deduplicated results* (`scanResults`) to `sessionStorage`, not the raw file list. When the user rescans, every file is fetched from scratch.

The Drive API supports a `modifiedTime > '<timestamp>'` filter in the `q` parameter. By caching the raw `FileRecord[]` list in `localStorage` alongside the timestamp of the last fetch, we can skip re-fetching unchanged files and only request the diff.

---

## Scope

- After a successful full scan, persist the raw file list and a `lastFetchedAt` timestamp to `localStorage`.
- On a subsequent scan, load the cache, fetch only files with `modifiedTime > lastFetchedAt`, merge them into the cache, then run deduplication on the merged list.
- Also handle deletions: files that disappeared from Drive since the last scan must be removed from the cache.
- Show "Using cached data from X ago" in the scan progress UI when an incremental scan is in progress.
- A "Force full rescan" option lets users bypass the cache.

---

## Detailed Requirements

### 1. Cache storage — new file `src/lib/scanCache.ts`

Responsible for reading and writing the raw file cache. Uses `localStorage` directly (not Zustand persist) to keep it separate from session state.

```ts
export interface ScanCache {
  lastFetchedAt: string;       // ISO timestamp
  files: FileRecord[];
  scanScope: { folderId: string; folderName: string } | null;
}

const CACHE_KEY = "drive-dup-finder:scan-cache";

export function readScanCache(): ScanCache | null
export function writeScanCache(cache: ScanCache): void
export function clearScanCache(): void
```

**Size concern:** A Drive with 10,000 files × ~300 bytes per `FileRecord` ≈ 3 MB. `localStorage` is typically limited to 5–10 MB. If serialization would exceed 4 MB, log a warning and skip caching (fall back to full scan silently). Implement a size check before `setItem`.

### 2. Drive API change — `src/lib/driveApi.ts`

Add an optional `modifiedSince` parameter to `listFilesPage`:

```ts
export async function listFilesPage(
  token: string,
  pageToken?: string,
  folderId?: string,
  modifiedSince?: string,  // ISO timestamp — NEW
): Promise<FilePage>
```

When `modifiedSince` is provided, add to the `q` parameter:

```
modifiedTime > '2024-01-15T10:30:00'
```

Note: The Drive API uses RFC 3339 format for `modifiedTime` comparisons. Ensure the timestamp is formatted correctly (no milliseconds, UTC timezone `Z` suffix).

Also add a function to fetch files that were trashed since a given time (to detect deletions from the cache):

```ts
export async function listRecentlyTrashedPage(
  token: string,
  since: string,
  pageToken?: string,
): Promise<FilePage>
```

Query: `trashed=true and modifiedTime > '<since>'`

### 3. Scan hook changes — `src/hooks/useScanFiles.ts`

Introduce two scan modes controlled by a new `ScanMode` type:

```ts
type ScanMode = "full" | "incremental";
```

**On scan start:**
1. Read the cache via `readScanCache()`.
2. If cache is valid and `scanScope` matches the cached scope → use `"incremental"` mode; set `modifiedSince` to `cache.lastFetchedAt`.
3. Otherwise → use `"full"` mode.

**During incremental mode:**
- Fetch only changed files (using `modifiedSince`).
- Fetch recently trashed files (using `listRecentlyTrashedPage`) to identify deletions.
- Merge: remove trashed file IDs from the cached list, then upsert (replace by `id`) changed files into the cached list.
- Run `runDeduplication` on the merged list.
- Write the updated cache via `writeScanCache`.

**During full mode:**
- Fetch all pages as today.
- On completion, write the full file list to `writeScanCache`.

### 4. Scan store changes — `src/store/scanStore.ts`

Add:

```ts
interface ScanState {
  // ... existing
  scanMode: "full" | "incremental" | null;
  cachedAt: string | null;           // ISO timestamp of last cache write
  setScanMode: (mode: "full" | "incremental") => void;
  setCachedAt: (ts: string) => void;
}
```

Reset `scanMode` and `cachedAt` in `resetScan()`. Do not persist these to `sessionStorage` (they are derived from `localStorage` on each scan start).

### 5. Scan progress UI — `src/components/ScanProgress.tsx`

When `scanMode === "incremental"`, show:

```
INCREMENTAL SCAN — cached X ago
Fetching changes only…
```

When `scanMode === "full"`, show the existing progress UI unchanged.

### 6. "Force full rescan" option

On the dashboard or results page, add a secondary action:

```
[ Rescan (incremental) ]   [ Force full rescan ]
```

"Force full rescan" calls `clearScanCache()` then `resetScan()` before navigating to `/scan`.

### 7. Cache invalidation rules

The cache must be treated as invalid and a full scan forced when:

- `scanScope` in the cache does not match the current `scanScope` in the store.
- The cached `files` array is empty.
- `localStorage` read fails (JSON parse error, quota exceeded, etc.).
- The user explicitly requests a full rescan.

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/scanCache.ts` | New — read/write/clear helpers for `localStorage` file cache |
| `src/lib/driveApi.ts` | Add `modifiedSince` param to `listFilesPage`; add `listRecentlyTrashedPage` |
| `src/hooks/useScanFiles.ts` | Implement incremental mode logic (cache read → diff fetch → merge) |
| `src/store/scanStore.ts` | Add `scanMode`, `cachedAt` state |
| `src/components/ScanProgress.tsx` | Show incremental scan status and cache age |
| `src/routes/dashboard.tsx` | Add "Force full rescan" secondary button |

---

## Edge Cases

- `localStorage` is unavailable (private browsing, quota exceeded) — catch the error and fall back to full scan silently.
- File deleted from Drive since last scan but `trashed` flag was not set (e.g. permanent delete via API) — `listRecentlyTrashedPage` won't catch this. Accept this limitation for v1; a full rescan will always correct it.
- Clock skew: if the local clock is significantly behind Drive's server time, `modifiedSince` may miss recent changes. Subtract a 60-second buffer from `lastFetchedAt` before using it as the filter timestamp.
- The user scans in full-Drive mode, then switches to folder-scoped mode — the cache from the full scan must not be used for the scoped scan (check `scanScope` match).

---

## Out of Scope

- Syncing the cache across multiple browser sessions or devices.
- Background / scheduled re-scans.
- Cache expiry (users can always force a full rescan manually).
