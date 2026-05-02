# ZUSTAND_STATE_SPEC.md — Global App State Management

> **Purpose:** Introduce Zustand as the global state layer for scan lifecycle and results. React Query continues to own all HTTP fetching and pagination. Zustand owns processed state, scan status, and persists it to `sessionStorage` so results survive route changes and browser refreshes within the same session.

---

## 1. Problem Statement

Currently, the scan produces data in two ways:
- Raw file pages are cached in React Query under `["scanFiles"]`  
- Processed `ScanResult` is written to React Query via `queryClient.setQueryData(["scanResults"], result)`

This causes three UX problems:

1. **No persistence across routes.** `setQueryData` without an active query observer uses the default 5-minute `gcTime`. If the user spends time on the dashboard and returns to `/results`, the cache may be cold and `scanResult` is `null`.
2. **Re-scan on remount.** Navigating back to `/scan` remounts the component with `enabled={true}`, triggering the entire paginated fetch again.
3. **No page-refresh survival.** React Query cache is in-memory only. A refresh wipes everything and the user has to scan again.

---

## 2. Architecture: Coexistence Model

React Query and Zustand have clearly separated responsibilities:

| Concern | Owner |
|---|---|
| Paginated Drive API fetching | React Query (`useInfiniteQuery`) |
| Scan status (`idle / scanning / complete / error`) | Zustand |
| Progress counter (`totalFiles`) | Zustand |
| Processed `ScanResult` (duplicate groups, file stats) | Zustand |
| `sessionStorage` persistence | Zustand `persist` middleware |
| File deletion HTTP call | React Query (`useMutation`) |
| Post-deletion result cleanup | Zustand (`removeFiles` action) |

React Query fetches; Zustand holds. They meet at the boundary of `useScanFiles.ts`.

---

## 3. Zustand Store Design

### 3.1 Install

```bash
npm install zustand
```

### 3.2 State Shape

```ts
// src/store/scanStore.ts

export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error'

interface ScanState {
  // --- State ---
  status:       ScanStatus
  totalFiles:   number
  scanResults:  ScanResult | null
  errorMessage: string | null

  // --- Actions ---
  startScan:      () => void
  updateProgress: (totalFiles: number) => void
  completeScan:   (results: ScanResult) => void
  setScanError:   (error: Error) => void
  resetScan:      () => void
  removeFiles:    (fileIds: string[]) => void
}
```

### 3.3 Action Behaviour

| Action | What it does |
|---|---|
| `startScan()` | Sets `status: 'scanning'`, clears `scanResults`, resets `totalFiles` to 0 |
| `updateProgress(n)` | Updates `totalFiles` — called after each paginated page resolves |
| `completeScan(results)` | Sets `status: 'complete'`, stores `scanResults`, sets `totalFiles` to `results.totalFilesScanned` |
| `setScanError(err)` | Sets `status: 'error'`, stores `err.message` in `errorMessage` |
| `resetScan()` | Returns all state to initial values — used by "RUN NEW SCAN" |
| `removeFiles(ids)` | Filters deleted file IDs out of `scanResults.duplicateGroups`; removes groups that drop below 2 files |

### 3.4 Persistence

Use Zustand's `persist` middleware with `sessionStorage` as the backing store. This means:
- Results survive navigation between routes
- Results survive a page refresh
- Results are cleared when the browser tab is closed (session ends)
- Results are cleared on logout (call `resetScan()` in the sign-out handler)

**Serialization note:** `ScanResult` contains two non-JSON-serializable types that must be handled with a custom storage adapter:

- `scannedAt: Date` → serialize as ISO string, deserialize back to `Date`
- `DuplicateGroup.selectedForDeletion: Set<string>` → serialize as `string[]`, deserialize back to `new Set()`. Selection state is ephemeral (not worth preserving across refreshes), so deserializing as an empty `Set` is intentional and correct.

```ts
// Custom PersistStorage<ScanState> adapter (pseudocode — full implementation in file)

getItem(name):
  read raw JSON string from sessionStorage
  if scanResults present:
    convert scannedAt string → new Date(...)
    convert each group's selectedForDeletion array → new Set()
  return parsed object

setItem(name, value):
  if scanResults present:
    convert scannedAt Date → .toISOString()
    convert each group's selectedForDeletion Set → [...set] (clear to [])
  write JSON.stringify to sessionStorage

removeItem(name):
  sessionStorage.removeItem(name)
```

Only these fields are persisted (via `partialize`):

```ts
partialize: (state) => ({
  status:       state.status,
  totalFiles:   state.totalFiles,
  scanResults:  state.scanResults,
  errorMessage: state.errorMessage,
})
```

Actions are not persisted (Zustand reconstructs them at runtime).

---

## 4. Updated Data Flow

### 4.1 First Scan (status: idle → scanning → complete)

```
User clicks EXECUTE_SCAN
  ↓
navigate({ to: "/scan" })
  ↓
ScanPage mounts
useScanFiles(true) sees status === 'idle' → calls startScan() → store status: 'scanning'
  ↓
useInfiniteQuery enabled, begins fetching pages
  ↓
After each page resolves → updateProgress(totalFiles)
  ↓
hasNextPage === false → runDeduplication(allFiles) → completeScan(result)
  ↓
store status: 'complete', scanResults stored, persisted to sessionStorage
  ↓
ScanPage detects status === 'complete' → wait 800ms → navigate('/results')
```

### 4.2 Navigating Back to /scan (status: complete)

```
User navigates to /scan
  ↓
ScanPage mounts
store status === 'complete' (hydrated from sessionStorage)
  ↓
useScanFiles sees isAlreadyComplete === true → query NOT enabled (no refetch)
  ↓
useEffect fires immediately → navigate('/results') with 0ms delay
  ↓
User never sees the scan page
```

### 4.3 Navigating Between Routes (results ↔ dashboard ↔ etc.)

```
store.scanResults remains in memory + sessionStorage
ResultsPage reads from useScanStore() — always available
DashboardPage reads from useScanStore() for QuickScanCard last-scan meta
No fetching, no cache expiry
```

### 4.4 File Deletion

```
User selects files → EXECUTE WIPE
  ↓
useDeleteFiles mutation calls trashFile() sequentially
  ↓
onSuccess: store.removeFiles(succeeded)
  ↓
Zustand updates scanResults.duplicateGroups in place
  ↓
ResultsPage re-renders from updated store
```

### 4.5 New Scan

```
User clicks RUN NEW SCAN
  ↓
queryClient.removeQueries({ queryKey: ["scanFiles"] })  ← clear React Query cache
store.resetScan()                                        ← clear Zustand store + sessionStorage
  ↓
navigate({ to: "/scan" })
  ↓
status === 'idle' → full scan runs again
```

---

## 5. File-by-File Changes

### 5.1 `src/store/scanStore.ts` — NEW FILE

Full Zustand store. Contains:
- `ScanStatus` type export
- `ScanState` interface
- `SerializedScanResult` / `SerializedDuplicateGroup` internal types for storage adapter
- `serializeScanResult()` and `deserializeScanResult()` helper functions
- Custom `PersistStorage<ScanState>` adapter (handles `Date` and `Set`)
- `useScanStore` default export via `create<ScanState>()(persist(...))`

### 5.2 `src/hooks/useScanFiles.ts` — MODIFY

Changes:
- Import `useScanStore` from the store
- Read `status` and `totalFiles` from the store
- Derive `isAlreadyComplete = status === 'complete'`
- Set `enabled: enabled && !!accessToken && !isAlreadyComplete` on `useInfiniteQuery` — prevents refetch when already done
- Add `useEffect` that calls `startScan()` when `enabled && status === 'idle'`
- Change progress `useEffect` to call `updateProgress(totalFiles)` instead of (nothing — currently no progress tracking in the store)
- Change deduplication `useEffect` to call `completeScan(result)` instead of `queryClient.setQueryData(["scanResults"], result)`
- Add error `useEffect` that calls `setScanError(error)` when `query.isError`
- Remove `useQueryClient` import (no longer needed here)
- Update return value: `totalFiles` comes from store when `isAlreadyComplete`, from query pages otherwise; `isComplete` is `isAlreadyComplete || (status === 'success' && !hasNextPage)`

### 5.3 `src/routes/scan.tsx` — MODIFY

Changes:
- Import `useScanStore`
- Read `status` from store via `const storeStatus = useScanStore(s => s.status)`
- Replace the single redirect `useEffect` with a version that uses `storeStatus`:
  - If `storeStatus === 'complete'` on mount (already complete) → `navigate` with **0ms delay** (instant)
  - If `storeStatus` transitions to `'complete'` after mount (just finished) → keep 800ms delay for animation
  - Use a `useRef(storeStatus === 'complete')` flag captured at mount time to distinguish the two cases
- Remove the `isComplete` check from `useScanFiles` return (now derived from store status directly)
- Error handling remains the same (still reads `isError` / `error` from `useScanFiles`)

### 5.4 `src/routes/results.tsx` — MODIFY

Changes inside `DuplicatesView`:
- Remove `useQueryClient` import
- Import `useScanStore`
- Replace `queryClient.getQueryData<ScanResult>(["scanResults"])` with `useScanStore(s => s.scanResults)`
- Replace `const [groups, setGroups] = useState(...)` initializer — still uses local state for selection management, but initialized from `scanResults?.duplicateGroups ?? []`
- In `handleConfirmDelete`: replace `queryClient.getQueryData<ScanResult>(["scanResults"])` post-delete sync with `useScanStore.getState().scanResults` (the store is already updated by `useDeleteFiles`)
- In `handleNewScan`: add `useScanStore.getState().resetScan()` call alongside the existing `queryClient.removeQueries` calls

### 5.5 `src/hooks/useDeleteFiles.ts` — MODIFY

Changes:
- Remove `useQueryClient` import
- Import `useScanStore`
- Replace entire `onSuccess` callback body: instead of `queryClient.setQueryData(["scanResults"], ...)` with inline group filtering, call `useScanStore.getState().removeFiles(succeeded)` — the same logic now lives in the store action

### 5.6 `src/context/AuthContext.tsx` — MODIFY (minor)

In `clearAuth()`, add a call to `useScanStore.getState().resetScan()` so that the `sessionStorage` entry is cleared when the user logs out. This prevents a logged-out user's scan data from being visible if someone else logs in on the same machine.

---

## 6. What Does NOT Change

- `src/lib/driveApi.ts` — no changes
- `src/lib/deduplicator.ts` — no changes
- `src/lib/formatters.ts` — no changes
- `src/types/drive.ts` — no changes
- `src/router.ts` / `routeTree.gen.ts` — no changes
- `src/routes/dashboard.tsx` — reads `scanResults` from store instead of query cache (small change, same pattern as results.tsx)
- All components (`DuplicateGroupCard`, `FileRow`, etc.) — no changes

---

## 7. File Checklist for Claude Code

| File | Action | Key detail |
|---|---|---|
| `package.json` | Add dependency | `"zustand": "^5.0.0"` |
| `src/store/scanStore.ts` | **Create** | Full store with persist middleware and custom sessionStorage adapter |
| `src/hooks/useScanFiles.ts` | Modify | Write to store instead of query cache; skip fetch when already complete |
| `src/routes/scan.tsx` | Modify | Instant redirect if already complete; 800ms delay only for fresh completion |
| `src/routes/results.tsx` | Modify | Read `scanResults` from store; call `resetScan()` on new scan |
| `src/hooks/useDeleteFiles.ts` | Modify | Replace `queryClient.setQueryData` with `store.removeFiles()` |
| `src/context/AuthContext.tsx` | Modify | Call `store.resetScan()` inside `clearAuth()` |

Do **not** touch the Drive API layer, deduplication algorithm, component files, or routing config.
