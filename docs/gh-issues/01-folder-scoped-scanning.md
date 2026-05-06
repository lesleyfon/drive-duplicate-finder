# Spec: Folder-Scoped Scanning

## Summary

Allow users to restrict a scan to a specific Google Drive folder instead of scanning the entire Drive. This makes the app practical for people with large Drives who know their duplicates are concentrated in a specific area (e.g. a Downloads or Uploads folder).

---

## Background & Motivation

Currently `listFilesPage` in `src/lib/driveApi.ts` queries `trashed=false` with no folder filter, which causes the Drive API to page through every file the user owns. For users with tens of thousands of files this takes several minutes and returns overwhelming results.

The Drive API supports a `'<folderId>' in parents` filter in the `q` parameter. Combined with the existing pagination logic, this is a low-cost change on the API side. The main work is the folder-picker UI and plumbing the selected folder ID through the scan pipeline.

---

## Scope

- A folder picker modal or inline input that lets users search and select a folder before starting a scan.
- When a folder is selected, the scan is restricted to that folder's direct and recursive contents.
- The scope choice is shown clearly in the scan progress UI and on the results page.
- Existing "scan everything" behaviour is preserved as the default.

---

## Detailed Requirements

### 1. Folder picker UI

**Where:** On the scan initiation surface (the dashboard's "Start Scan" button or a pre-scan configuration step before navigating to `/scan`).

**Behaviour:**
- A text input with a "Browse" button opens a folder picker modal.
- The modal shows the user's top-level Drive folders via the Drive API (`mimeType='application/vnd.google-apps.folder' and trashed=false`).
- Folders can be navigated (click to open) to pick a nested folder.
- Selecting a folder shows its name in the input and stores its `id`.
- A "Clear" button resets to full-Drive mode.
- The selected folder name and id are stored in `useScanStore` as `scanScope: { folderId: string; folderName: string } | null`.

### 2. Drive API change — `src/lib/driveApi.ts`

Add an optional `folderId` parameter to `listFilesPage`:

```ts
export async function listFilesPage(
  token: string,
  pageToken?: string,
  folderId?: string,   // NEW
): Promise<FilePage>
```

When `folderId` is provided, append to the `q` parameter:

```
'<folderId>' in parents
```

For recursive scanning (files in sub-folders), use:

```
'<folderId>' in parents
```

…and walk sub-folders. Two implementation options:

- **Option A (simple, recommended for v1):** Non-recursive — only scan the direct children of the selected folder. Document this limitation clearly in the UI ("Scanning direct contents of…").
- **Option B (complete):** Recursive — fetch sub-folder IDs first (`mimeType='application/vnd.google-apps.folder' and '<folderId>' in parents`), then fan out page fetches per sub-folder. This is more complex but gives users full coverage.

**Start with Option A.** Option B can be a follow-up.

### 3. Scan store changes — `src/store/scanStore.ts`

Extend `ScanState`:

```ts
interface ScanState {
  // ... existing fields
  scanScope: { folderId: string; folderName: string } | null;  // NEW
  setScanScope: (scope: { folderId: string; folderName: string } | null) => void;  // NEW
}
```

Persist `scanScope` alongside existing persisted fields. Reset `scanScope` in `resetScan()`.

### 4. Hook change — `src/hooks/useScanFiles.ts`

Read `scanScope` from the store and pass `scanScope?.folderId` to `listFilesPage`:

```ts
const scanScope = useScanStore((s) => s.scanScope);

// Inside queryFn:
return listFilesPage(accessToken ?? "", pageParam, scanScope?.folderId);
```

### 5. Scan progress UI — `src/components/ScanProgress.tsx` and `src/routes/scan.tsx`

When a scope is active, show the folder name beneath the progress indicator:

```
SCANNING: "Downloads" (direct contents only)
```

### 6. Results page — `src/routes/results.tsx`

Show a scope badge near the page header when results are from a scoped scan:

```
SCOPE: Downloads folder
```

### 7. New API helper — `src/lib/driveApi.ts`

Add a function to list folders for the picker:

```ts
export async function listFolders(
  token: string,
  parentId?: string,
): Promise<{ id: string; name: string }[]>
```

Query: `mimeType='application/vnd.google-apps.folder' and trashed=false and '<parentId>' in parents` (default `parentId` to `'root'`).

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/driveApi.ts` | Add `folderId` param to `listFilesPage`; add `listFolders` helper |
| `src/store/scanStore.ts` | Add `scanScope` state + `setScanScope` action |
| `src/hooks/useScanFiles.ts` | Pass `folderId` from store to `listFilesPage` |
| `src/components/FolderPicker.tsx` | New component — modal with folder browse/select |
| `src/components/ScanProgress.tsx` | Show scope label when active |
| `src/routes/scan.tsx` | Wire `FolderPicker` into pre-scan UI |
| `src/routes/results.tsx` | Show scope badge in header |

---

## Edge Cases

- User selects a folder, then clears it before starting — treat as full-Drive scan.
- Folder is empty or contains no non-Google-Apps files — show the existing "no duplicates found" empty state.
- API returns a 404 for the folder ID (folder deleted after selection) — surface an error before the scan starts.
- Scoped scan results must not be merged with a prior full-Drive scan result. If `scanScope` changes, force a full `resetScan()`.

---

## Out of Scope

- Recursive folder scanning (deferred to follow-up).
- Scanning multiple folders in a single scan.
- Remembering the last-used folder across sessions (can be added later via `localStorage`).
