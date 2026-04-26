# UPDATED_THEME.md — Terminal Noir Cyan

> **Purpose:** This document tells Claude Code exactly how to retheme the Drive Duplicate Finder app to match the "CLEANUP_OS" design shown in the mockup. It covers Tailwind config, global CSS, layout restructuring, and every component. Follow this top-to-bottom.

---

## 1. Overview of Changes

The app is being visually rebranded from a generic Tailwind UI to a "Terminal Noir Cyan" aesthetic — a high-contrast, data-dense interface that looks and feels like a sophisticated command-line tool. The app name displayed in the UI changes to **CLEANUP_OS**.

Key principles:
- **Zero border radius** — every element is sharp-cornered, no exceptions
- **Black/dark grey backgrounds** with **Electric Cyan** (#00F0FF) as the only accent color
- **Space Grotesk** as the exclusive typeface
- **Tonal layering for depth** — no shadows, ever; elevation is created with stacked dark surfaces and 1px borders
- **Uppercase labels, monospace-style spacing** — the UI reads like a terminal log

---

## 2. Tailwind Configuration (`tailwind.config.ts`)

Replace the current empty `extend: {}` with the full custom theme below.

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      DEFAULT: '0px',
    },
    fontFamily: {
      sans: ['"Space Grotesk"', 'monospace'],
      mono: ['"Space Grotesk"', 'monospace'],
    },
    extend: {
      colors: {
        // Backgrounds
        'ink':         '#000000',
        'surface':     '#131313',
        'surface-dim': '#0e0e0e',
        'surface-low': '#1b1b1b',
        'surface-mid': '#1f1f1f',
        'surface-high': '#2a2a2a',
        'surface-top': '#353535',

        // Borders
        'border-dim':  '#222222',
        'border-mid':  '#3b494b',
        'border-bright': '#849495',

        // Primary — Electric Cyan
        'cyan-bright': '#00F0FF',
        'cyan-dim':    '#00DBE9',
        'cyan-dark':   '#004F54',
        'cyan-ink':    '#002022',

        // Text
        'text-primary':   '#E2E2E2',
        'text-secondary': '#B9CACB',
        'text-muted':     '#849495',
        'text-inverse':   '#131313',

        // Status
        'status-ok':      '#00F0FF',   // cyan = active/success
        'status-warn':    '#EAC324',   // yellow = warning/likely duplicate
        'status-error':   '#FFB4AB',   // salmon = error
        'status-grey':    '#849495',   // grey = informational
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '64px',
      },
      fontSize: {
        'label': ['11px', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '500' }],
        'nav':   ['13px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'nav-2': ['13px', { lineHeight: '1', letterSpacing: '0em',   fontWeight: '400' }],
        'body':  ['14px', { lineHeight: '1.6', letterSpacing: '0em' }],
        'sm':    ['12px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'md':    ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'lg':    ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        indeterminate: {
          '0%':   { transform: 'translateX(-100%) scaleX(0.5)' },
          '50%':  { transform: 'translateX(0%) scaleX(0.7)' },
          '100%': { transform: 'translateX(100%) scaleX(0.5)' },
        },
      },
      animation: {
        blink:         'blink 1s step-end infinite',
        indeterminate: 'indeterminate 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## 3. Global CSS (`src/index.css`)

Replace the existing file entirely:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after {
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  html, body, #root {
    height: 100%;
    background-color: #131313;
    color: #E2E2E2;
    font-family: 'Space Grotesk', monospace;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  /* Scrollbar — terminal style */
  ::-webkit-scrollbar       { width: 6px; background: #0e0e0e; }
  ::-webkit-scrollbar-thumb { background: #3b494b; }
  ::-webkit-scrollbar-thumb:hover { background: #00DBE9; }

  /* Remove default focus ring; replace with cyan border */
  :focus-visible {
    outline: 1px solid #00F0FF;
    outline-offset: 0;
  }

  /* Checkbox — terminal square */
  input[type="checkbox"] {
    appearance: none;
    width: 14px;
    height: 14px;
    border: 1px solid #849495;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
  }
  input[type="checkbox"]:checked {
    background-color: #00F0FF;
    border-color: #00F0FF;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5L4 7.5L8.5 2.5' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
    background-size: 10px;
    background-repeat: no-repeat;
    background-position: center;
  }

  /* Radio — terminal square (not circle) */
  input[type="radio"] {
    appearance: none;
    width: 14px;
    height: 14px;
    border: 1px solid #849495;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
  }
  input[type="radio"]:checked {
    border-color: #00F0FF;
    background-color: #00F0FF;
  }
}

@layer components {
  /* Blinking cursor for inputs */
  .cursor-blink::after {
    content: '▋';
    color: #00F0FF;
    animation: blink 1s step-end infinite;
  }
}
```

---

## 4. App Layout & Navigation

The app uses a **fixed left sidebar + main content** layout. This replaces the current top `NavBar`.

### Root Layout (`src/routes/__root.tsx`)

Wrap authenticated content in this shell:

```tsx
<div className="flex h-screen bg-surface overflow-hidden">
  {/* Sidebar */}
  <aside className="w-[260px] flex-shrink-0 bg-surface-dim border-r border-border-dim flex flex-col">
    {/* Logo */}
    <div className="px-6 py-5 border-b border-border-dim">
      <span className="text-cyan-bright text-lg font-bold uppercase tracking-widest">
        CLEANUP_OS
      </span>
      <p className="text-text-muted text-label uppercase mt-1 tracking-widest">
        DRIVE_SCANNER_V1
      </p>
    </div>

    {/* Nav items — see Section 4.1 */}
    <nav className="flex-1 overflow-y-auto py-4">
      {/* ... */}
    </nav>

    {/* Bottom nav */}
    <div className="border-t border-border-dim py-4 px-6 space-y-1">
      <SidebarItem icon={<Settings size={14} />} label="SETTINGS" to="/settings" level={1} />
      <SidebarItem icon={<LogOut size={14} />} label="LOG_OUT" onClick={signOut} level={1} />
    </div>
  </aside>

  {/* Main content */}
  <main className="flex-1 overflow-y-auto bg-surface">
    <Outlet />
  </main>
</div>
```

### 4.1 Sidebar Nav Items

Create `src/components/SidebarItem.tsx`:

```tsx
// Level 1 — bold, uppercase, with optional left active bar
// Level 2 — indented 16px, connected by a 1px vertical guide line in #222

// Active state (level 1): left 4px solid cyan bar, text white
// Active state (level 2): text white
// Hover: bg-[#111111], text white
// Default: text-text-secondary

// Level 1 example classes:
// "flex items-center gap-3 px-6 py-2 text-nav uppercase tracking-widest
//  hover:bg-[#111] hover:text-text-primary text-text-secondary
//  border-l-4 border-transparent
//  data-[active=true]:border-cyan-bright data-[active=true]:text-text-primary"

// Level 2 — add relative left guide line:
// "pl-[38px] border-l border-border-dim ml-6 py-1 text-nav-2"
```

### 4.2 Sidebar Nav Structure (Results / Dashboard views)

```
ROOT_DIRECTORY
  DRIVE_SCANNER_V1

STORAGE SUMMARY            ← links to /dashboard

FILES BY CATEGORY          ← section heading (not clickable)
  └── DUPLICATES           ← /results?filter=all      [ACTIVE STATE shown in mockup]
  └── SAME FOLDER          ← /results?filter=same-folder
  └── HIDDEN               ← /results?filter=hidden
  └── EMPTY                ← /results?filter=empty
  └── LARGE                ← /results?filter=large
  └── OLD                  ← /results?filter=old

FOLDERS BY CATEGORY        ← future feature, render disabled/muted

STORAGE ANALYZER           ← /dashboard
BROWSE GROUPS              ← /results

SETTINGS
LOG_OUT
```

---

## 5. Page Headers

Each page's header area follows this pattern (shown at top of content area, not in sidebar):

```tsx
<div className="px-8 py-5 border-b border-border-dim flex items-center justify-between">
  {/* Breadcrumb */}
  <div>
    <p className="text-label uppercase tracking-widest text-text-muted mb-1">
      FILES BY CATEGORY / <span className="text-cyan-bright">DUPLICATE FILES</span>
    </p>
    <h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
      DUPLICATE_SCANNER.LOG
    </h1>
  </div>

  {/* Action buttons */}
  <div className="flex gap-3">
    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors">
      <Trash2 size={12} />
      BULK DELETE TOOL
    </button>
    <button className="flex items-center gap-2 px-4 py-2 border border-text-primary text-text-primary text-label uppercase tracking-widest hover:bg-surface-high transition-colors">
      <Download size={12} />
      EXPORT CSV
    </button>
  </div>
</div>
```

---

## 6. Component Updates

### 6.1 `DuplicateGroupCard.tsx`

Each group is a bordered card. The group header row contains the GROUP_ID, duplicate count badge, and potential reclaim on the right.

```tsx
// Card wrapper
<div className="border border-border-dim mb-px bg-surface">

  {/* Group header */}
  <div className="flex items-center justify-between px-5 py-3 border-b border-border-dim">
    <div className="flex items-center gap-3">
      <button onClick={toggle} className="text-text-muted hover:text-cyan-bright">
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      <span className="text-label uppercase tracking-widest text-text-muted">
        GROUP_ID: <span className="text-text-secondary">{group.key.substring(0,8).toUpperCase()}</span>
      </span>
      {/* Count badge */}
      <span className="px-2 py-0.5 bg-cyan-dark border border-cyan-dim text-cyan-bright text-label uppercase">
        {group.files.length} DUPLICATES FOUND
      </span>
    </div>
    <span className="text-label uppercase tracking-widest text-text-muted">
      POTENTIAL RECLAIM: <span className="text-text-primary">{formatBytes(group.totalWastedBytes)}</span>
    </span>
  </div>

  {/* File rows — only shown when expanded */}
  {expanded && group.files.map(file => <FileRow key={file.id} file={file} />)}
</div>
```

**Collapsed state** (used when a group has many files): show just the header row with a collapsed chevron. The collapsed header shows the filename and an "8 DUPLICATES" badge, matching the `REPORTS_Q3_FINAL.PDF` row in the mockup.

### 6.2 `FileRow.tsx`

```tsx
<div className="flex items-center gap-4 px-5 py-3 border-b border-border-dim
                hover:bg-surface-low transition-colors group">

  {/* Checkbox */}
  <input type="checkbox" checked={isSelected} onChange={onToggle} />

  {/* Thumbnail / file icon */}
  <FileThumbnail file={file} size={40} />  {/* see 6.3 */}

  {/* Name + path */}
  <div className="flex-1 min-w-0">
    <p className="text-body text-text-primary truncate font-medium">{file.name}</p>
    <p className="text-sm text-text-muted truncate">{folderPath}</p>
  </div>

  {/* Date */}
  <span className="text-sm text-text-secondary w-28 text-right flex-shrink-0">
    {formatDate(file.modifiedTime)}  {/* e.g. "AUG 30, 2022" */}
  </span>

  {/* Size */}
  <span className="text-body font-semibold text-text-primary w-20 text-right flex-shrink-0">
    {formatBytes(file.size)}
  </span>
</div>
```

Date format should be `MMM DD, YYYY` uppercase (e.g. `AUG 30, 2022`).

### 6.3 `FileThumbnail.tsx`

- For image files: render a `<img>` thumbnail with `object-cover`, wrapped in a `w-10 h-10 border border-border-dim bg-surface-high` container.
- For audio files: use a music note icon on a dark background.
- For documents/PDFs: use a file icon.
- No border radius on any thumbnail container.

### 6.4 `ConfidenceBadge.tsx`

```tsx
// Exact Match
<span className="px-2 py-0.5 text-label uppercase tracking-widest
                 bg-cyan-dark border border-cyan-dim text-cyan-bright">
  EXACT MATCH
</span>

// Likely Duplicate
<span className="px-2 py-0.5 text-label uppercase tracking-widest
                 bg-[#3B2F00] border border-[#EAC324] text-[#EAC324]">
  LIKELY DUPLICATE
</span>

// Possible Version
<span className="px-2 py-0.5 text-label uppercase tracking-widest
                 border border-border-bright text-text-muted">
  POSSIBLE VERSION
</span>
```

### 6.5 `StorageBar.tsx`

```tsx
<div className="px-8 py-4 border-b border-border-dim">
  <div className="flex items-center justify-between mb-2">
    <span className="text-label uppercase tracking-widest text-text-muted">STORAGE USAGE</span>
    <span className="text-sm text-text-secondary">{usedGb} GB of {totalGb} GB</span>
  </div>
  {/* Track */}
  <div className="h-1 w-full bg-surface-high border border-border-dim">
    <div
      className="h-full bg-cyan-bright transition-all"
      style={{ width: `${pct}%` }}
    />
  </div>
</div>
```

### 6.6 `ScanProgress.tsx`

```tsx
<div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
  <h2 className="text-md uppercase tracking-widest text-text-primary">
    SCAN_IN_PROGRESS
  </h2>
  <div className="w-full max-w-xl h-1 bg-surface-high border border-border-dim overflow-hidden relative">
    {isIndeterminate
      ? <div className="absolute inset-y-0 bg-cyan-bright w-1/3 animate-indeterminate" />
      : <div className="h-full bg-cyan-bright transition-all" style={{ width: `${pct}%` }} />
    }
  </div>
  <p className="text-sm text-text-muted uppercase tracking-widest">
    OBJECTS_PARSED: <span className="text-text-primary">{count.toLocaleString()}</span>
  </p>
  <button className="px-6 py-2 border border-border-bright text-text-secondary text-label uppercase tracking-widest hover:border-text-primary hover:text-text-primary transition-colors">
    CANCEL
  </button>
</div>
```

### 6.7 `DeleteModal.tsx`

```tsx
// Modal overlay
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
  {/* Modal box — no border radius */}
  <div className="bg-surface border border-border-mid w-full max-w-lg">
    {/* Header */}
    <div className="px-6 py-4 border-b border-border-dim flex items-center justify-between">
      <h2 className="text-nav uppercase tracking-widest text-text-primary">CONFIRM_DELETE</h2>
      <button onClick={onClose} className="text-text-muted hover:text-cyan-bright">
        <X size={16} />
      </button>
    </div>
    {/* Body */}
    <div className="px-6 py-5 space-y-4">
      <p className="text-sm text-status-warn uppercase tracking-widest">
        ⚠ FILES WILL BE MOVED TO TRASH — RECOVERABLE WITHIN 30 DAYS
      </p>
      {/* File list */}
      <div className="border border-border-dim max-h-48 overflow-y-auto">
        {files.map(f => (
          <div key={f.id} className="px-4 py-2 border-b border-border-dim last:border-0 text-sm text-text-secondary">
            {f.name}
          </div>
        ))}
      </div>
      <p className="text-label uppercase tracking-widest text-text-muted">
        SPACE_TO_FREE: <span className="text-text-primary">{formatBytes(totalBytes)}</span>
      </p>
    </div>
    {/* Actions */}
    <div className="px-6 py-4 border-t border-border-dim flex gap-3 justify-end">
      <button onClick={onClose}
        className="px-5 py-2 border border-text-secondary text-text-secondary text-label uppercase tracking-widest hover:border-text-primary hover:text-text-primary transition-colors">
        CANCEL
      </button>
      <button onClick={onConfirm}
        className="px-5 py-2 bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors">
        EXECUTE_WIPE
      </button>
    </div>
  </div>
</div>
```

---

## 7. System Selection Panel (Bottom-Right Overlay)

When one or more files are checked on the results screen, show this fixed overlay in the bottom-right corner:

```tsx
{selectedCount > 0 && (
  <div className="fixed bottom-6 right-6 bg-surface border border-cyan-dim p-5 w-52 z-40">
    <p className="text-label uppercase tracking-widest text-cyan-bright mb-2">SYSTEM SELECTION</p>
    <p className="text-[32px] font-bold leading-none text-text-primary mb-1">{selectedCount}</p>
    <p className="text-label uppercase tracking-widest text-text-secondary mb-3">FILES MARKED</p>
    <p className="text-sm text-text-muted mb-4">
      SPACE_TO_FREE: <span className="text-text-primary">{formatBytes(spaceToFree)}</span>
    </p>
    <button onClick={openDeleteModal}
      className="w-full py-2 bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors">
      EXECUTE_WIPE
    </button>
  </div>
)}
```

---

## 8. Status Bar (Bottom of Main Content)

Add a fixed bottom status bar to the results page when a scan is complete:

```tsx
<div className="border-t border-border-dim px-8 py-2 flex items-center gap-6 text-label uppercase tracking-widest">
  <span className="text-text-muted">
    SCAN_STATUS: <span className="text-status-ok">COMPLETED</span>
  </span>
  <span className="text-border-bright">|</span>
  <span className="text-text-muted">
    TIME: <span className="text-text-secondary">{scanTime}s</span>
  </span>
  <span className="text-border-bright">|</span>
  <span className="text-text-muted">
    OBJECTS_PARSED: <span className="text-text-secondary">{totalParsed.toLocaleString()}</span>
  </span>
</div>
```

---

## 9. Login Page (`src/routes/index.tsx`)

Replace the current login screen with a centered terminal-style card:

```tsx
<div className="min-h-screen bg-ink flex items-center justify-center">
  <div className="border border-border-dim bg-surface p-10 w-full max-w-sm">
    {/* Logo */}
    <div className="mb-8">
      <h1 className="text-lg font-bold uppercase tracking-widest text-cyan-bright">CLEANUP_OS</h1>
      <p className="text-label uppercase tracking-widest text-text-muted mt-1">DRIVE_SCANNER_V1</p>
    </div>

    <p className="text-sm text-text-secondary mb-8">
      Find and remove duplicate files from your Google Drive. No backend required.
    </p>

    {/* Sign-in button */}
    <button onClick={signIn}
      className="w-full py-3 bg-cyan-bright text-ink font-semibold text-label uppercase tracking-widest hover:bg-cyan-dim transition-colors flex items-center justify-center gap-2">
      AUTHENTICATE_GOOGLE
    </button>

    <p className="text-sm text-text-muted mt-5">
      You may see an "unverified app" warning from Google. Click Advanced → Continue to proceed.
    </p>
  </div>
</div>
```

---

## 10. Buttons — Reference Classes

| Variant | Classes |
|---|---|
| Primary (filled cyan) | `bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors px-4 py-2` |
| Secondary (outline white) | `border border-text-primary text-text-primary text-label uppercase tracking-widest hover:bg-surface-high transition-colors px-4 py-2` |
| Ghost | `text-text-muted text-label uppercase tracking-widest hover:text-cyan-bright transition-colors` |
| Danger | `bg-status-error text-ink text-label uppercase tracking-widest font-semibold hover:opacity-90 px-4 py-2` |

---

## 11. Typography — Reference Classes

| Use | Classes |
|---|---|
| Page title | `text-lg font-bold uppercase tracking-widest text-text-primary` |
| Section heading | `text-md font-semibold uppercase tracking-widest text-text-primary` |
| Body text | `text-body text-text-secondary` |
| Muted label | `text-label uppercase tracking-widest text-text-muted` |
| Cyan label | `text-label uppercase tracking-widest text-cyan-bright` |
| Data value | `text-body font-semibold text-text-primary` |
| File path | `text-sm text-text-muted` |

---

## 12. What NOT to Change

- All TypeScript business logic, hooks, API calls, and routing remain unchanged.
- Only visual/styling files should be touched: `tailwind.config.ts`, `src/index.css`, and all `*.tsx` component/route files.
- Do not add shadows (`shadow-*`), border radius (`rounded-*`), or gradient utilities anywhere.
- Do not change font imports in `index.html` — add the Google Fonts `<link>` tag for Space Grotesk there instead:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  ```
