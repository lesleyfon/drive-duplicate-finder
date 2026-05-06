# Spec: In-App Restore (Recently Deleted)

## Summary

Add a "Recently Deleted" view that lists files the user has trashed via this app (and any other files currently in their Drive Trash), and lets them restore individual files or batches with a single click. This closes the deletion loop and gives users more confidence when deleting duplicates.

---

## Background & Motivation

The README documents that deleted files go to Trash and are recoverable within 30 days, but there is no way to undo from within the app. The Drive API supports listing trashed files and untrashing them via a `PATCH files/<id>` call with `{ trashed: false }` — the same mechanism already used in reverse for deletion (`trashFile` in `src/lib/driveApi.ts`). Adding a restore view requires one new API function, one new route, and a sidebar nav entry.

---

## Scope

- A new `/trash` route showing files currently in the user's Drive Trash.
- Users can restore individual files or select multiple and restore in bulk.
- The view is read-only — it does not provide permanent deletion from Trash (the Drive UI handles that).
- A sidebar link makes the view discoverable.

---

## Detailed Requirements

### 1. Drive API additions — `src/lib/driveApi.ts`

**List trashed files:**

```ts
export interface TrashedFilePage {
  files: FileRecord[];
  nextPageToken?: string;
}

export async function listTrashedFilesPage(
  token: string,
  pageToken?: string,
): Promise<TrashedFilePage>
```

Query parameters:
```
q: trashed=true
fields: nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,owners,parents,webViewLink,thumbnailLink,fullFileExtension,trashed)
pageSize: 100
orderBy: modifiedTime desc
```

Filter to files owned by the user (`owners.some(o => o.me)`) as in `listFilesPage`.

**Restore a file:**

```ts
export async function untrashFile(token: string, fileId: string): Promise<void>
```

Implementation: `PATCH /files/<fileId>?supportsAllDrives=true` with body `{ trashed: false }`. This is the exact inverse of the existing `trashFile` function.

### 2. New hook — `src/hooks/useTrashFiles.ts`

```ts
export function useListTrashedFiles()
```

Uses `useInfiniteQuery` with `queryKey: ["trashedFiles"]` to paginate through `listTrashedFilesPage`. Auto-fetches all pages (same pattern as `useScanFiles`).

```ts
export function useRestoreFiles()
```

Uses `useMutation`. On success, invalidates the `["trashedFiles"]` query so the list refreshes automatically.

```ts
async function restoreSequentially(
  token: string,
  fileIds: string[],
): Promise<{ succeeded: string[]; failed: { fileId: string; error: string }[] }>
```

Same sequential-with-delay pattern as `deleteSequentially` in `useDeleteFiles.ts` (100 ms between calls).

### 3. New route — `src/routes/trash.tsx`

Register with TanStack Router as `/trash`.

**Page structure:**

```
CLEANUP / RECENTLY DELETED          ← breadcrumb (matches existing style)
RECENTLY DELETED                    ← h1

[ Select All ]  [ Restore Selected (N) ]    ← action bar, hidden when nothing selected

<file list>
  ☐  filename.pdf     PDF · 4.2 MB · trashed 2 days ago    [ Restore ]
  ☐  report.docx     Word · 1.1 MB · trashed 5 days ago    [ Restore ]
  ...

<empty state when trash is empty>
  NO FILES IN TRASH
  Files you delete will appear here for 30 days.
```

**Columns / fields shown per file:**
- Checkbox (for multi-select)
- File icon (use existing `FileThumbnail` component)
- File name (truncated if long)
- MIME type label (human-readable, e.g. "PDF", "Word Document", "JPEG Image")
- File size (formatted via `formatBytes`)
- "Trashed X ago" relative time (use `modifiedTime` as proxy for trash date, since the Drive API does not expose a separate `trashedTime` in v3)
- Individual "Restore" button per row

**Loading state:** show a spinner while pages are loading (same style as `ScanProgress`).

**Error state:** show an inline error message if the query fails, with a retry button.

### 4. Bulk restore flow

- Selecting any checkbox reveals the action bar with "Restore Selected (N)".
- "Select All" selects all loaded files (across all fetched pages).
- Clicking "Restore Selected" calls `useRestoreFiles` with the array of selected IDs.
- During restore, show a loading state on the button ("RESTORING…") and disable all checkboxes.
- On success, show a success banner: "X files restored to Drive." The list refreshes automatically via query invalidation.
- On partial failure (some IDs failed), show: "X files restored. Y files could not be restored — check your connection and try again."

### 5. Sidebar navigation — `src/components/NavBar.tsx` or `SidebarItem.tsx`

Add a "Recently Deleted" link to the sidebar navigation, grouped with the existing cleanup actions. Use a trash/restore icon (lucide-react `Trash2` or `RotateCcw`).

The link navigates to `/trash`. No badge count needed for v1.

### 6. Route registration — `src/routeTree.gen.ts` and `src/router.ts`

TanStack Router requires the new route to be registered. Follow the existing pattern:
- Create `src/routes/trash.tsx` with `createFileRoute('/trash')`.
- Re-run `tsr generate` (or add manually to `routeTree.gen.ts` following the existing pattern) so the route is picked up.

### 7. Post-restore: sync with scan results

When a file is restored from Trash, it should re-appear in future scans. No immediate sync with `scanStore` is needed — the user should rescan after restoring. However, add a notice below the success banner:

```
Your scan results may be out of date. Run a new scan to see restored files.
```

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/driveApi.ts` | Add `listTrashedFilesPage` and `untrashFile` |
| `src/hooks/useTrashFiles.ts` | New — `useListTrashedFiles` and `useRestoreFiles` |
| `src/routes/trash.tsx` | New — Recently Deleted page |
| `src/routeTree.gen.ts` | Register `/trash` route |
| `src/components/NavBar.tsx` | Add "Recently Deleted" sidebar link |

---

## Edge Cases

- Trash is empty — show the empty state UI (not a spinner or error).
- A file in Trash was permanently deleted between when the list was fetched and when restore is clicked — the `untrashFile` call will return a 404. Treat as a failure in the partial-failure banner.
- User has thousands of files in Trash — paginate with the same `useInfiniteQuery` pattern; auto-load all pages (Drive API returns max 100 per page).
- The restored file's parent folder was also deleted — the Drive API will restore the file to the root "My Drive" folder. This is standard Drive behaviour and does not need special handling.
- The `/trash` route is accessed before the user is authenticated — the existing auth guard in `src/routes/__root.tsx` should redirect to `/` as with other protected routes.

---

## Out of Scope

- Permanent deletion from within the app (too destructive; use Drive UI for that).
- Filtering or sorting the trash list (v1 uses Drive API's default `modifiedTime desc` order).
- Showing which specific scan session deleted each file.
