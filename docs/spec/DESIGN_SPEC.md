---
title: Drive Duplicate Finder — Design Specification
author: Lesley
date: April 2026
---

# Drive Duplicate Finder — Design Specification

## 1. Project Overview

**Goal:** A React web application (TanStack stack) that authenticates with Google Drive, scans all files, identifies duplicates using multiple comparison strategies, and lets the user safely review and delete redundant files — all from the browser with no backend server required.

**Why build it:** Existing tools (e.g. Filerev) are paywalled or limit scans. This app is fully owned by the user, runs unlimited scans, and can be customised freely.

**Hosting:** Served locally via Vite dev server (`npm run dev`) during development, running on `http://localhost:5173` by default. Can later be deployed to GitHub Pages or Netlify (free tier) for permanent access.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 | Component model fits the multi-screen UI perfectly |
| Build Tool | Vite | Fast HMR, zero-config, standard for React projects |
| Routing | TanStack Router | Type-safe file-based routing between app screens |
| Data Fetching | TanStack Query | Handles Drive API pagination, caching, loading/error states |
| Auth | Google Identity Services (GIS) | Official Google OAuth 2.0 library for SPAs |
| API | Google Drive API v3 | Returns md5Checksum, size, mimeType natively |
| Styling | Tailwind CSS | Utility-first, integrates cleanly with Vite |
| Icons | Lucide React | Lightweight SVG icons, React-native |
| State | TanStack Query cache + React context | No need for Redux; query cache holds scan results |
| Language | TypeScript | Type safety for API response shapes and data models |

---

## 3. Google Cloud Configuration

**Project:** `drive-duplicate-finder-494514`

**Client ID:** `694089468468-e4lq1nh66vf01rbk47qhjf552e0ko4gv.apps.googleusercontent.com`

**Credentials file:** `client_secret_*.json` (already saved in the project folder — never embed the client_secret in frontend code; it is only needed for server-side flows)

**Authorised JavaScript origins (update these in Google Cloud Console as needed):**

- `http://localhost:5173` — Vite default dev server port
- `http://localhost` — fallback
- Add production domain here when deploying (e.g. `https://yourapp.netlify.app`)

**To update origins:** Google Cloud Console → APIs & Services → Clients → click the client → edit Authorized JavaScript Origins → Save. Changes take up to 5 minutes to propagate.

**OAuth scopes required:**

- `https://www.googleapis.com/auth/drive.metadata.readonly` — to list and read file metadata
- `https://www.googleapis.com/auth/drive.readonly` — to read file content if needed for deeper comparison
- `https://www.googleapis.com/auth/drive` — to move files to trash (delete)

**Important:** When first running the app, Google will show an "unverified app" warning screen because this project has not gone through Google's OAuth verification process. Click "Advanced" → "Go to Drive Duplicate Finder (unsafe)" to proceed. This is normal for personal/private apps. Add a note on the login screen so users are not alarmed.

---

## 4. Application Screens & Routes

TanStack Router should use file-based routing. Each screen is a route file.

| Route | File | Screen |
|---|---|---|
| `/` | `index.tsx` | Login / landing page |
| `/dashboard` | `dashboard.tsx` | Post-login dashboard |
| `/scan` | `scan.tsx` | Scanning progress |
| `/results` | `results.tsx` | Duplicate results + delete UI |

A root layout component wraps all authenticated routes and redirects to `/` if no access token is present in context.

---

### Screen 1 — Login Page (`/`)

**Shown when:** User is not authenticated.

**Elements:**

- App logo / name: "Drive Duplicate Finder"
- Tagline: "Find and remove duplicate files from your Google Drive"
- "Sign in with Google" button (uses GIS `initTokenClient`)
- Brief explanation of what permissions are requested and why
- Note about the "unverified app" warning users may see

**Behaviour:** On successful token grant, store the access token in a React context (AuthContext), then navigate to `/dashboard`.

---

### Screen 2 — Dashboard (`/dashboard`)

**Shown when:** User is authenticated but no scan has been run yet (or after a scan is cleared).

**Elements:**

- Top navigation bar: app name, user avatar + email (from token info), "Sign out" button
- Storage usage card (TanStack Query call to Drive `about` endpoint): e.g. "14.2 GB used of 15 GB"
- Large "Start Scan" button (primary CTA)
- Short description of what the scan does and how long it may take

**Behaviour:** "Start Scan" navigates to `/scan` and triggers the scan query.

---

### Screen 3 — Scanning Progress (`/scan`)

**Shown when:** Scan is in progress.

**Elements:**

- Animated progress bar (indeterminate while pages are loading, then percentage-based once total is known)
- Status line: "Scanning… 1,240 files found so far"
- Estimated time remaining (once at least 2 pages have loaded, calculate rate)
- "Cancel" button (navigates back to `/dashboard`)

**Behaviour:**

1. TanStack Query infinite query calls `drive.files.list` with `pageSize=1000`, looping via `nextPageToken`
2. Each page result is appended to the in-memory list
3. On completion, the deduplication algorithm runs synchronously (all in-memory)
4. Result is stored in a dedicated TanStack Query cache key (e.g. `['scanResults']`)
5. Navigates automatically to `/results`

---

### Screen 4 — Results Page (`/results`)

**Shown when:** Scan is complete and results are cached.

**Elements:**

- Summary banner: "Found X duplicate groups (Y files, Z GB recoverable)"
- Filter toolbar:
  - Filter by: All / Exact Matches only / Likely Duplicates only
  - Sort by: Size (largest first) / Number of copies / File type
  - Search box: filter by filename
- Duplicate group cards (one card per group), each showing:
  - File name
  - File type icon + MIME type label
  - Number of copies
  - Total wasted space (e.g. "2 extra copies × 4.2 MB = 8.4 MB wasted")
  - Confidence badge: "Exact Match" (green) or "Likely Duplicate" (yellow)
  - Expand/collapse toggle
- When expanded, each file in the group shows:
  - File name (link opens file in Google Drive)
  - Folder location (fetched lazily on expand)
  - File size (human-readable)
  - Last modified date
  - Created date
  - MD5 checksum (shown for Exact Match groups)
  - Owner name
  - "Keep this one" radio button
  - Checkbox to mark for deletion
- Sticky bottom bar: "Delete X files (Y GB)" button, disabled until at least one file is checked

---

### Screen 5 — Delete Confirmation Modal

**Shown when:** User clicks the sticky "Delete" button on `/results`.

**Elements:**

- Modal overlay
- List of files about to be deleted
- Total space to be freed
- Warning text: "Files will be moved to Trash. You can restore them from Google Drive Trash within 30 days."
- "Confirm Delete" button (triggers deletion mutation)
- "Cancel" button

---

### Screen 6 — Post-Deletion State (on `/results`)

**Shown when:** Deletion TanStack mutation completes.

**Elements:**

- Toast / inline success banner: "Deleted X files. Y GB freed."
- Any errors shown inline per file (e.g. file not found, permission denied)
- Deleted files removed from the results cards
- "Run New Scan" button (clears cache, navigates to `/scan`)

---

## 5. Duplicate Detection Algorithm

Files are compared in a layered pipeline. Each layer filters down the candidate set so subsequent layers work on a smaller group. This runs entirely in memory after all pages are fetched.

### Layer 1 — Exclude non-comparable files

Skip the following (surface count in UI as informational note):

- Google Workspace native files (`mimeType` starts with `application/vnd.google-apps.*`) — no `size` or `md5Checksum`
- Folders (`application/vnd.google-apps.folder`)
- Shortcuts (`application/vnd.google-apps.shortcut`)
- Trashed files (excluded at query level with `q=trashed=false`)

### Layer 2 — Group by MIME type

Files of different MIME types cannot be duplicates. Group into buckets by `mimeType`.

### Layer 3 — Group by file size

Within each MIME type group, sub-group by exact byte size (`size` field). Different sizes = definitively not duplicates.

### Layer 4 — MD5 checksum comparison → "Exact Match"

Within each size-matched group, compare `md5Checksum`. Identical MD5 = identical content. Flag as **Exact Match** (green badge). Safe to auto-select extras for deletion.

### Layer 5 — Filename comparison → "Likely Duplicate"

Files with the same `name` (case-sensitive) AND same `size` but different MD5 checksums are flagged as **Likely Duplicate** (yellow badge). Requires user review before deletion.

### Layer 6 — Advisory signals (informational only, not auto-flagged)

Surfaced as hints in the UI but never auto-selected for deletion:

- Same `name`, different sizes → "Possible versions" (grey badge)
- Same `createdTime` → may indicate a batch copy
- Filenames containing "(1)", "(2)", or "Copy of" patterns → common Google Drive copy naming

### Confidence Levels Summary

| Badge | Criteria | Action |
|---|---|---|
| Exact Match (green) | Same MIME + size + MD5 | Safe to auto-select extras |
| Likely Duplicate (yellow) | Same MIME + size + name | User must review |
| Possible Version (grey) | Same name, different size | Informational only |

---

## 6. Google Drive API Calls

### 6.1 Get storage quota

```
GET https://www.googleapis.com/drive/v3/about
  ?fields=storageQuota
```

Returns: `storageQuota.limit`, `storageQuota.usage`

Use as a TanStack Query query on the `/dashboard` route.

### 6.2 List all files (paginated infinite query)

```
GET https://www.googleapis.com/drive/v3/files
  ?pageSize=1000
  &fields=nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,owners,parents,webViewLink,fullFileExtension,trashed)
  &q=trashed=false
```

- Use TanStack Query `useInfiniteQuery` with `getNextPageParam` returning `nextPageToken`
- `pageSize=1000` is the Drive API maximum
- Loop until `nextPageToken` is absent

### 6.3 Move a file to trash (mutation)

```
PATCH https://www.googleapis.com/drive/v3/files/{fileId}
  Body: { "trashed": true }
```

Use a TanStack Query `useMutation`. Process deletions sequentially with a 100ms delay between calls to avoid hitting API rate limits. Never use the `DELETE` endpoint — always trash.

### 6.4 Get parent folder name (lazy, on group expand)

```
GET https://www.googleapis.com/drive/v3/files/{folderId}
  ?fields=id,name
```

Fetched only when a duplicate group is expanded. Cache with TanStack Query using `['folder', folderId]` as the key.

---

## 7. Data Models (TypeScript interfaces)

```typescript
interface FileRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;           // null for Google Workspace files
  md5Checksum: string | null;    // null if unavailable
  createdTime: string;           // ISO 8601
  modifiedTime: string;          // ISO 8601
  owners: { displayName: string; emailAddress: string }[];
  parents: string[];             // Parent folder IDs
  webViewLink: string;
  fullFileExtension: string | null;
  trashed: boolean;
}

type ConfidenceLevel = 'exact' | 'likely' | 'version';

interface DuplicateGroup {
  key: string;                   // Composite grouping key
  confidence: ConfidenceLevel;
  files: FileRecord[];
  totalWastedBytes: number;      // (files.length - 1) * files[0].size
  selectedForDeletion: Set<string>; // Set of file IDs
  keepFileId: string | null;     // ID of file user marked as "keep"
}

interface ScanResult {
  totalFilesScanned: number;
  excludedFiles: number;
  duplicateGroups: DuplicateGroup[];
  scannedAt: Date;
}
```

---

## 8. Project File Structure

```
drive-duplicate-finder/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .gitignore                        ← includes client_secret*.json and .env*
├── client_secret_*.json              ← OAuth credentials (gitignored, never committed)
├── DESIGN_SPEC.docx                  ← This document
├── src/
│   ├── main.tsx                      ← Vite entry, renders RouterProvider
│   ├── router.ts                     ← TanStack Router instance
│   ├── env.ts                        ← exports GOOGLE_CLIENT_ID constant
│   ├── context/
│   │   └── AuthContext.tsx           ← Stores access token, user info, expiry
│   ├── hooks/
│   │   ├── useGoogleAuth.ts          ← GIS token client setup and token management
│   │   ├── useScanFiles.ts           ← TanStack infinite query for Drive file listing
│   │   ├── useStorageQuota.ts        ← TanStack query for Drive about endpoint
│   │   └── useDeleteFiles.ts         ← TanStack mutation for trashing files
│   ├── lib/
│   │   ├── driveApi.ts               ← All raw Drive API fetch functions
│   │   ├── deduplicator.ts           ← Pure deduplication algorithm (layers 1-6)
│   │   └── formatters.ts             ← Human-readable bytes, dates, etc.
│   ├── routes/
│   │   ├── __root.tsx                ← Root layout, auth guard
│   │   ├── index.tsx                 ← Login screen
│   │   ├── dashboard.tsx             ← Dashboard screen
│   │   ├── scan.tsx                  ← Scanning progress screen
│   │   └── results.tsx               ← Results + delete screen
│   └── components/
│       ├── NavBar.tsx
│       ├── StorageBar.tsx
│       ├── DuplicateGroupCard.tsx
│       ├── FileRow.tsx
│       ├── ConfidenceBadge.tsx
│       ├── DeleteModal.tsx
│       └── ScanProgress.tsx
└── public/
    └── favicon.ico
```

---

## 9. Key Implementation Notes for Claude Code

1. **Use Google Identity Services (GIS)**, not the deprecated `gapi.auth2`. Load it via a `<script>` tag in `index.html`: `https://accounts.google.com/gsi/client`. Initialise the token client inside a `useEffect` in `useGoogleAuth.ts`.

2. **Token-based (implicit) flow.** Use `google.accounts.oauth2.initTokenClient()` to request an access token in the browser. Store the token in `AuthContext`. Check `expires_in` and prompt re-auth before the token expires (tokens last 1 hour).

3. **TanStack Query for all Drive calls.** Wrap the paginated file listing in `useInfiniteQuery`. Wrap the quota call in `useQuery`. Wrap file trashing in `useMutation`.

4. **Deduplication runs after all pages are fetched.** Use `useInfiniteQuery`'s `hasNextPage` — only run `deduplicator.ts` once `hasNextPage === false`. Pass the flattened `pages` array to the deduplication function.

5. **Rate limiting.** Drive API quota is 1,000 requests per 100 seconds per user. Scanning uses ~1 request per 1,000 files — rarely an issue. For deletion, add a 100ms delay between each trash PATCH call using a sequential async loop (not `Promise.all`).

6. **Null-check size and md5Checksum always.** These fields are `undefined` in the API response for Google Workspace files. TypeScript interfaces should reflect this as `null`.

7. **"Keep this one" UX logic.** Selecting "keep" on one file in a group should auto-check all other files in the group for deletion and disable their "keep" radio. Deselecting "keep" should uncheck all others.

8. **Never permanently delete.** Always PATCH with `{ trashed: true }`. Do not use the Drive API `delete` endpoint.

9. **Folder path resolution is expensive.** Fetch parent folder names lazily — only when a group card is expanded. Use TanStack Query with `['folder', folderId]` key so repeated expansions use cache.

10. **The Client ID is safe to embed in frontend code.** Only the Client Secret must be kept private (it's in the JSON file and only needed for server-side flows). Store the Client ID in `src/env.ts` as a constant: `export const GOOGLE_CLIENT_ID = '694089468468-e4lq1nh66vf01rbk47qhjf552e0ko4gv.apps.googleusercontent.com';`

11. **TypeScript declarations for GIS.** The GIS library does not ship TypeScript types. Add `@types/google.accounts` or declare a minimal ambient type in `src/types/google.d.ts` to avoid TS errors.

---

## 10. Edge Cases to Handle

| Scenario | Handling |
|---|---|
| User has 0 files | Show "Your Drive is empty" on results screen |
| Scan finds 0 duplicates | Show "No duplicates found! Your Drive is clean." |
| File deleted between scan and deletion | Catch 404 from API, skip and show warning, continue with others |
| User loses internet during scan | Catch fetch error, show "Scan interrupted — please retry" |
| Drive API quota exceeded | Catch 429, show "Too many requests — please wait and retry" |
| Access token expires mid-scan | Detect 401, prompt re-auth, then resume from last page token |
| File owned by another user | Show owner name; warn that deletion may affect others |
| File is in a Shared Drive | Add `supportsAllDrives=true` and `includeItemsFromAllDrives=true` to query params |
| Very large drives (50k+ files) | Show file count live during scan, estimate time remaining |

---

## 11. Future Enhancements (Not in V1)

- **Export report:** Download a CSV of all duplicates found
- **Auto-keep rules:** "Always keep the newest copy" or "Always keep the copy in My Drive"
- **Folder-level scan:** Scan a specific folder instead of all of Drive
- **Google Workspace file comparison:** Compare Docs/Sheets by exported content hash
- **Scheduled scans:** Run automatically on a schedule
- **Multi-account support:** Scan across multiple Google accounts

