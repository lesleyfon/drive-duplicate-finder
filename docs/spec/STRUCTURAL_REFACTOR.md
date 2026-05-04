# Structural Refactor Spec
_Step-by-step tasks for Claude Code. Do not change any UI or user-facing behaviour._

---

## Overview

Three structural problems to fix, in the order below. Each is a separate, independently-shippable change.

| # | Problem | Files affected |
|---|---|---|
| 1 | `old-files.tsx` imports `getTypeStyle` from `large-files.tsx` (sibling route) | `large-files.tsx`, `old-files.tsx`, new `src/lib/mimeStyles.ts` |
| 2 | ~85% code duplication between `large-files.tsx` and `old-files.tsx` | Both routes, new `src/hooks/useFileListState.ts` |
| 3 | Both routes imperatively call `useScanStore.getState()` after a mutation instead of using a reactive selector | Both routes |

Fix them in order: **3 → 1 → 2**. Fixing the imperative store read (3) first simplifies the hook extraction (2).

---

## Fix 3 — Replace imperative store read with a reactive selector

### What the problem is

After a successful delete, both routes manually re-sync their local `files` state by calling the store imperatively:

```ts
// large-files.tsx — inside handleConfirmDelete try block
setFiles(useScanStore.getState().scanResults?.largeFiles ?? []);

// old-files.tsx — inside handleConfirmDelete try block
setFiles(useScanStore.getState().scanResults?.oldFiles ?? []);
```

This is an antipattern. The store's `removeFiles` action (scanStore.ts line 194) already removes the deleted IDs from `scanResults.largeFiles` and `scanResults.oldFiles`. If `files` were driven by a reactive Zustand selector instead of local state, the component would update automatically — no manual re-sync needed.

### Steps

#### Step 3.1 — `large-files.tsx`: replace local `files` state with a reactive selector

**Remove**:
```ts
const [files, setFiles] = useState<FileRecord[]>(() => scanResult?.largeFiles ?? []);
```

**Add** (directly after the `scanResult` selector line):
```ts
const files = useScanStore((s) => s.scanResults?.largeFiles ?? []);
```

#### Step 3.2 — `large-files.tsx`: remove the manual re-sync from `handleConfirmDelete`

**Remove** this line from inside the `try` block (line 134):
```ts
setFiles(useScanStore.getState().scanResults?.largeFiles ?? []);
```

Nothing replaces it — the reactive selector makes it unnecessary.

#### Step 3.3 — `old-files.tsx`: replace local `files` state with a reactive selector

**Remove**:
```ts
const [files, setFiles] = useState<FileRecord[]>(() => scanResult?.oldFiles ?? []);
```

**Add** (directly after the `scanResult` selector line):
```ts
const files = useScanStore((s) => s.scanResults?.oldFiles ?? []);
```

#### Step 3.4 — `old-files.tsx`: remove the manual re-sync from `handleConfirmDelete`

**Remove** this line from inside the `try` block (line 114):
```ts
setFiles(useScanStore.getState().scanResults?.oldFiles ?? []);
```

#### Step 3.5 — Clean up unused imports

After the above changes, `FileRecord` is no longer used as a type annotation for a local `useState` in either file. Check whether the `FileRecord` import is still needed elsewhere in each file (it is used in `selectedFiles` and in the `visibleFiles` memo via `.map`). Keep the import — it is still needed.

In `large-files.tsx`, the `useState` import is still needed for `selected`, `sort`, `search`, `showModal`, `successMessage`, and `_errorMessage`. Keep it.

In `old-files.tsx`, same — `useState` is still needed. Keep it.

---

## Fix 1 — Move `getTypeStyle` / `TYPE_COLORS` to `src/lib/mimeStyles.ts`

### What the problem is

`old-files.tsx` line 13 imports a utility from a sibling route file:
```ts
import { getTypeStyle } from "./large-files";
```

Route files should not import from other route files. `getTypeStyle` and `TYPE_COLORS` are pure styling utilities that belong in `src/lib/`.

### Steps

#### Step 1.1 — Create `src/lib/mimeStyles.ts`

Create a new file at `src/lib/mimeStyles.ts` with the following content (moved verbatim from `large-files.tsx` lines 16–38):

```ts
import { classifyMime } from "./deduplicator";

export const TYPE_COLORS: Record<string, { light: string; dark: string; text: string }> = {
  video:    { light: "#fde8e8", dark: "#2d1515", text: "#f5a623" },
  audio:    { light: "#fff8e6", dark: "#221a08", text: "#667eeae6" },
  document: { light: "#e8f7f1", dark: "#102918", text: "#00c48c" },
  image:    { light: "#e8f9fd", dark: "#0b1f22", text: "#00f0ff" },
  other:    { light: "#f0f0f0", dark: "#1a1a1a", text: "#849495" },
};

export function getTypeStyle(
  mimeType: string,
  theme: "light" | "dark",
): { bg: string; text: string } {
  const family = classifyMime(mimeType);
  const classStyle = TYPE_COLORS[family];

  if (classStyle) {
    return { bg: classStyle[theme], text: classStyle.text };
  }
  return {
    bg: theme === "light" ? "var(--theme-count-badge-bg)" : "var(--theme-border)",
    text: "var(--theme-text-secondary)",
  };
}
```

#### Step 1.2 — Update `large-files.tsx`

**Remove** the `TYPE_COLORS` and `getTypeStyle` definitions (lines 16–38) — they are now in `mimeStyles.ts`.

**Add** this import near the top of the file, alongside the other `../lib/` imports:
```ts
import { TYPE_COLORS, getTypeStyle } from "../lib/mimeStyles";
```

`TYPE_COLORS` and `getTypeStyle` keep their `export` keyword in `mimeStyles.ts` and can stay named exports in `large-files.tsx` as re-exports if anything else in the codebase currently imports them from `large-files.tsx`. To be safe, add these re-exports at the bottom of `large-files.tsx` after removing the definitions:

```ts
export { TYPE_COLORS, getTypeStyle } from "../lib/mimeStyles";
```

This preserves any existing import paths until all consumers are updated.

#### Step 1.3 — Update `old-files.tsx`

**Replace** line 13:
```ts
// BEFORE
import { getTypeStyle } from "./large-files";

// AFTER
import { getTypeStyle } from "../lib/mimeStyles";
```

#### Step 1.4 — (Optional, follow-up) Remove the re-exports from `large-files.tsx`

Once you've confirmed nothing else in the codebase imports `getTypeStyle` from `./large-files` (run `grep -r "from.*large-files" src/`), remove the re-export line added in Step 1.2. The `export type { LargeSortType }` and `export const LARGE_SORT_TABS` / `TABLE_COL_TEMPLATE` should stay as they are only used internally or may be needed by tests.

---

## Fix 2 — Extract `useFileListState` hook

### What the problem is

The two route components share approximately 85% of their logic. The duplicated sections are:

| Duplicated piece | large-files.tsx lines | old-files.tsx lines |
|---|---|---|
| `selected` / `sort` / `search` / `showModal` / `successMessage` / `errorMessage` state | 60–65 | 37–42 |
| Search filter in `visibleFiles` memo | 76–83 | 55–63 |
| `allVisibleSelected` derived value | 95–96 | 76–77 |
| `toggleSelect` | 98–103 | 79–84 |
| `toggleSelectAll` | 105–121 | 86–101 |
| `selectedFiles` / `totalSelectedBytes` / `hasSelection` | 123–125 | 103–105 |
| `handleConfirmDelete` (try/catch body) | 127–144 | 107–123 |
| Success banner JSX | 216–222 | 195–201 |
| Delete modal JSX | 410–419 | 403–412 |

The only meaningful differences between the two components are:
- The page icon, title, and empty-state copy
- The sort tabs and their keys (`LargeSortType` vs `OldSortType`)
- The sort logic inside `visibleFiles` (size/name/date vs date/name/size)
- The table columns rendered (`large-files` shows SIZE + MODIFIED; `old-files` shows CREATED + SIZE)
- `large-files` computes `sizeRankMap`; `old-files` computes `ageRankMap`

### Steps

#### Step 2.1 — Create `src/hooks/useFileListState.ts`

Create a new file at `src/hooks/useFileListState.ts`:

```ts
import { useMemo, useState } from "react";
import { useDeleteFiles } from "./useDeleteFiles";
import { formatBytes } from "../lib/formatters";
import type { FileRecord } from "../types/drive";

export interface UseFileListStateOptions<S extends string> {
  /** The reactive file list, read from the store outside this hook. */
  files: FileRecord[];
  /** The default sort key for this view. */
  defaultSort: S;
  /**
   * Pure sort function. Receives the already-search-filtered list and
   * the current sort key. Return a new sorted array (do not mutate).
   */
  sortFn: (files: FileRecord[], sort: S) => FileRecord[];
}

export interface UseFileListStateReturn<S extends string> {
  // ── State ──────────────────────────────────────────────────────────
  selected: Set<string>;
  sort: S;
  setSort: (s: S) => void;
  search: string;
  setSearch: (s: string) => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  successMessage: string | null;
  errorMessage: string | null;
  // ── Derived ────────────────────────────────────────────────────────
  visibleFiles: FileRecord[];
  allVisibleSelected: boolean;
  selectedFiles: FileRecord[];
  totalSelectedBytes: number;
  hasSelection: boolean;
  // ── Actions ────────────────────────────────────────────────────────
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  handleConfirmDelete: () => Promise<void>;
  isPending: boolean;
}

export function useFileListState<S extends string>({
  files,
  defaultSort,
  sortFn,
}: UseFileListStateOptions<S>): UseFileListStateReturn<S> {
  const deleteMutation = useDeleteFiles();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<S>(defaultSort);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleFiles = useMemo(() => {
    let result = [...files];
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.mimeType.toLowerCase().includes(query) ||
          (file.fullFileExtension ?? "").toLowerCase().includes(query),
      );
    }
    return sortFn(result, sort);
  }, [files, sort, search, sortFn]);

  const allVisibleSelected =
    visibleFiles.length > 0 && visibleFiles.every((file) => selected.has(file.id));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    const ids = visibleFiles.map((file) => file.id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectedFiles = files.filter((file) => selected.has(file.id));
  const totalSelectedBytes = selectedFiles.reduce((s, file) => s + (file.size ?? 0), 0);
  const hasSelection = selected.size > 0;

  const handleConfirmDelete = async () => {
    const ids = Array.from(selected);
    const freedBytes = selectedFiles.reduce((total, f) => total + (f.size ?? 0), 0);
    try {
      const result = await deleteMutation.mutateAsync(ids);
      setShowModal(false);
      setSelected(new Set());
      setSuccessMessage(
        `Deleted ${result.succeeded.length} file${result.succeeded.length !== 1 ? "s" : ""}. ${formatBytes(freedBytes)} freed.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ""}`,
      );
    } catch {
      setShowModal(false);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return {
    selected,
    sort,
    setSort,
    search,
    setSearch,
    showModal,
    setShowModal,
    successMessage,
    errorMessage,
    visibleFiles,
    allVisibleSelected,
    selectedFiles,
    totalSelectedBytes,
    hasSelection,
    toggleSelect,
    toggleSelectAll,
    handleConfirmDelete,
    isPending: deleteMutation.isPending,
  };
}
```

**Notes on the hook:**
- `files` is passed in from the component (which reads it from the reactive store selector added in Fix 3). The hook does not touch the store directly.
- `sortFn` is a stable callback — the caller should define it with `useCallback` or as a module-level constant to avoid re-creating `visibleFiles` on every render.
- `handleConfirmDelete` no longer calls `setFiles(...)` because Fix 3 already makes the store reactive. The hook simply clears `selected` and sets the success message.

#### Step 2.2 — Refactor `large-files.tsx` to use the hook

**Remove** the following duplicated blocks from `RouteComponent`:
- `selected`, `sort`, `search`, `showModal`, `successMessage`, `_errorMessage` useState declarations
- `visibleFiles` useMemo
- `allVisibleSelected` derived value
- `toggleSelect` and `toggleSelectAll`
- `selectedFiles`, `totalSelectedBytes`, `hasSelection`
- `handleConfirmDelete`

**Add** a module-level sort function above `RouteComponent` (so it's stable and doesn't trigger `useMemo` churn):

```ts
function sortLargeFiles(files: FileRecord[], sort: LargeSortType): FileRecord[] {
  const result = [...files];
  if (sort === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "date") {
    result.sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime));
  } else {
    result.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
  }
  return result;
}
```

**Add** the hook call inside `RouteComponent`, after the `files` reactive selector:

```ts
const {
  selected,
  sort, setSort,
  search, setSearch,
  showModal, setShowModal,
  successMessage,
  errorMessage: _errorMessage,
  visibleFiles,
  allVisibleSelected,
  selectedFiles,
  totalSelectedBytes,
  hasSelection,
  toggleSelect,
  toggleSelectAll,
  handleConfirmDelete,
  isPending,
} = useFileListState<LargeSortType>({
  files,
  defaultSort: "size",
  sortFn: sortLargeFiles,
});
```

**Update** the `DeleteModal` props — replace `isPending={deleteMutation.isPending}` with `isPending={isPending}`, and remove the `deleteMutation` variable declaration that is no longer used directly in the component.

**Add** the import at the top of the file:
```ts
import { useFileListState } from "../hooks/useFileListState";
```

**Remove** the now-unused `useDeleteFiles` import (it is used inside the hook, not the component directly).

#### Step 2.3 — Refactor `old-files.tsx` to use the hook

**Remove** the following duplicated blocks from `RouteComponent`:
- `selected`, `sort`, `search`, `showModal`, `successMessage`, `errorMessage` useState declarations
- `visibleFiles` useMemo
- `allVisibleSelected` derived value
- `toggleSelect` and `toggleSelectAll`
- `selectedFiles`, `totalSelectedBytes`, `hasSelection`
- `handleConfirmDelete`

**Add** a module-level sort function above `RouteComponent`:

```ts
function sortOldFiles(files: FileRecord[], sort: OldSortType): FileRecord[] {
  const result = [...files];
  if (sort === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "size") {
    result.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
  } else {
    // date: oldest first
    result.sort((a, b) => a.createdTime.localeCompare(b.createdTime));
  }
  return result;
}
```

**Add** the hook call inside `RouteComponent`, after the `files` reactive selector:

```ts
const {
  selected,
  sort, setSort,
  search, setSearch,
  showModal, setShowModal,
  successMessage,
  errorMessage,
  visibleFiles,
  allVisibleSelected,
  selectedFiles,
  totalSelectedBytes,
  hasSelection,
  toggleSelect,
  toggleSelectAll,
  handleConfirmDelete,
  isPending,
} = useFileListState<OldSortType>({
  files,
  defaultSort: "date",
  sortFn: sortOldFiles,
});
```

**Update** the `DeleteModal` props — replace `isPending={deleteMutation.isPending}` with `isPending={isPending}`, and remove the now-unused `deleteMutation` variable and `useDeleteFiles` import.

**Add** the import at the top of the file:
```ts
import { useFileListState } from "../hooks/useFileListState";
```

The `useCallback` import has already been removed from `old-files.tsx` (it was only used for the `ageMs` helper, which was deleted when the AGE bar column was removed). No action needed.

---

## What must NOT change

- No UI or JSX structure changes in either route.
- No changes to `scanStore.ts`, `useDeleteFiles.ts`, `deduplicator.ts`, or any other file not explicitly listed above.
- The exported types `LargeSortType` and `OldSortType` should remain exported from their respective route files (they may be used by TanStack Router's generated `routeTree.gen.ts`).
- `TABLE_COL_TEMPLATE`, `LARGE_SORT_TABS`, and `OLD_SORT_TABS` stay in their respective route files — they are view-specific constants, not shared logic.

---

## Verification checklist

After each fix, verify:

- [ ] `npm run build` (or `tsc --noEmit`) produces zero type errors
- [ ] `grep -r "from.*large-files" src/routes/` returns no results (after Fix 1 step 1.4)
- [ ] Both the Large Files and Old Files views render correctly and display their file lists
- [ ] Selecting files and clicking Delete Selected opens the modal, and confirming the delete removes the files from the list without a page reload
- [ ] The success banner appears after deletion
- [ ] The search input filters both views correctly
- [ ] Sort tabs change the row order in both views
