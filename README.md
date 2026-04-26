# Drive Duplicate Finder

A free, open-source web app that scans your Google Drive for duplicate files and helps you safely remove them — freeing up storage space at no cost.

> **Privacy first:** This app runs entirely in your browser. It does not have a backend server, does not store your files, and does not save any of your personal data. Your Google credentials and Drive contents never leave your device.

---

## Features

- Scans your entire Google Drive for duplicate files
- Detects duplicates by file type, name, size, and MD5 checksum
- Shows exactly how much storage space you can recover
- Lets you review duplicates before deleting anything
- Moves files to Trash (not permanent deletion — recoverable within 30 days)

---

## Getting Started

### 1. Run the app

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Sign in with Google

Click **"Sign in with Google"** on the home screen. You will be redirected to Google's sign-in page.

> **Note:** You may see a warning that says *"Drive Duplicate Finder has not completed the Google verification process."* This is expected for a personal app that has not gone through Google's public review. Click **"Advanced"** → **"Go to Drive Duplicate Finder (unsafe)"** to continue. The app is safe — it only reads your file metadata and moves files to Trash when you explicitly ask it to.

### 3. Grant permissions — select everything

On the permissions screen, make sure **all three options are checked**:

| Permission | Why it's needed |
|---|---|
| ✅ See, edit, create, and delete all of your Google Drive files | Required to move duplicate files to Trash |
| ✅ See and download all your Google Drive files | Required to read file contents for comparison |
| ✅ See information about your Google Drive files | Required to list files and read metadata (name, size, type, checksum) |

**Make sure "Select all" is checked before clicking Continue**, as shown below:

![OAuth consent screen showing all permissions selected](docs/oauth-screenshot.png)

> Without all three permissions, the app will not be able to scan your Drive or delete files on your behalf.

Click **"Continue"** to proceed.

### 4. Scan your Drive

Once signed in, click **"Start Scan"**. The app will fetch metadata for all your files. Depending on how many files you have, this may take a few minutes.

### 5. Review and delete

Duplicates are grouped by confidence level:

- 🟢 **Exact Match** — files with identical content (safe to delete extras)
- 🟡 **Likely Duplicate** — same name and size, minor differences (review before deleting)
- ⚪ **Possible Version** — same name, different size (shown for reference only)

Select the files you want to remove, click **"Delete"**, and confirm. Files are moved to your Google Drive Trash — you have 30 days to restore them if needed.

---

## Privacy & Data

- **No backend server.** The app runs entirely in your browser.
- **No data is stored.** File metadata is held in memory during your session and discarded when you close the tab.
- **No personal information is collected or transmitted** to any third party.
- **Your Google credentials** are managed entirely by Google's own OAuth system and are never seen by this app.
- The app only accesses your Drive when you are actively using it.

---

## Development

```bash
npm install       # Install dependencies
npm run dev       # Start local dev server at http://localhost:5173
npm run build     # Build for production
npm run preview   # Preview production build locally
```

---

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/overview)

---

## License

MIT — free to use, modify, and distribute.
