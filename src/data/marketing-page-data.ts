import { Code2, Eye, Layers, Lock, Trash2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const NAV_ITEMS = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Privacy", "#privacy"],
  ["FAQ", "#faq"],
];
export const MOCK_UP_FILES = [
  "report_2024.pdf",
  "report_2024 (1).pdf",
  "report_2024_v2.pdf",
];

export const MARKETING_FEATURES = [
  "Free forever",
  "100% browser-based",
  "MIT licensed",
] as const;

export const MARKETING_FEATURES_DETAILS = [
  ["2.4 GB", "average recoverable per scan"],
  ["< 30 sec", "to scan 5,000 files"],
  ["0 bytes", "leave your browser"],
  ["100%", "open source"],
];

export const GITHUB_URL = "https://github.com/lesleyfon/drive-duplicate-finder";
export const W = "max-w-[1100px] mx-auto px-[28px]";

export const MARKETING_NAV_ITEMS: [string, [string, string][]][] = [
  [
    "Product",
    [
      ["Features", "#features"],
      ["How it works", "#how-it-works"],
      ["Privacy", "#privacy"],
      ["FAQ", "#faq"],
    ],
  ],
  [
    "Project",
    [
      ["GitHub", GITHUB_URL],
      ["Contribute", GITHUB_URL],
    ],
  ],
  ["Resources", [["License (MIT)", GITHUB_URL]]],
] as [string, [string, string][]][];

/* ── Results Mockup ─────────────────────────────────────────────────── */

export const MOCKUP_GROUPS = [
  {
    type: "EXACT",
    count: 3,
    name: "vacation_video.mp4",
    size: "10.3 MB",
    expanded: false,
  },
  {
    type: "VERSION",
    count: 5,
    name: "report_2024.pdf",
    size: "127 KB",
    expanded: true,
  },
  {
    type: "LIKELY",
    count: 4,
    name: "song_master.mp3",
    size: "4.1 MB",
    expanded: false,
  },
] as const;

/* ── Static data ────────────────────────────────────────────────────── */

export const FAQS: [string, string][] = [
  [
    "Is Drive Duplicate Cleaner free to use?",
    "Yes — completely free and open source under the MIT license. There are no paid tiers, no premium features, and no data sold.",
  ],
  [
    "Does this tool store my Google Drive files?",
    "No. The app runs entirely in your browser. There is no backend server, no database, and your files never leave your device.",
  ],
  [
    "How does it detect duplicate files?",
    "Files are compared using MD5 checksums for exact matches, then by name and size for likely duplicates. You can review every match before deleting.",
  ],
  [
    "Are deletions permanent?",
    "No — files are moved to your Google Drive Trash, where they remain recoverable for 30 days.",
  ],
  [
    "What permissions does it need?",
    "Drive read access to scan files and list metadata, and Drive write access to move duplicates to Trash. The app never touches files you don't explicitly select.",
  ],
  [
    "Why does Google show an 'unverified app' warning?",
    "This is a personal, open-source app that hasn't gone through Google's paid public-app verification process. Click Advanced → Continue to proceed. The code is on GitHub if you want to audit it first.",
  ],
];

export const PRIVACY_ITEMS: [string, string][] = [
  [
    "No backend server",
    "The app is static files. There's nothing on the receiving end to log, breach, or sell.",
  ],
  [
    "No data collection",
    "No analytics scripts. No cookies that track. No telemetry. Your scan results live in memory until you close the tab.",
  ],
  [
    "No file transfer",
    "We compute checksums and diffs in your browser. The Drive API streams metadata — never file contents — directly to your machine.",
  ],
  [
    "Auditable code",
    "Every line is on GitHub. Read it, fork it, run it locally, host it yourself. We don't ask for trust because you don't have to.",
  ],
];

export const STEPS = [
  {
    n: "01",
    title: "Sign in with Google",
    body: "Standard OAuth flow. Grant Drive read/write so we can list files and move duplicates to Trash. No password, no account creation. You may see an 'unverified app' notice — click Advanced → Continue.",
    time: "~10 sec",
  },
  {
    n: "02",
    title: "Scan your Drive",
    body: "We stream file metadata from the Drive API, compute checksums, and group matches by exact / likely / version-variant confidence levels. Nothing is uploaded anywhere — the work happens in your browser.",
    time: "~30 sec",
  },
  {
    n: "03",
    title: "Review duplicate groups",
    body: "Browse groups by category — Same Folder, Largest Files, Hidden, Old, Not Owned By Me. Inspect every file. Check what you want to delete; uncheck what you want to keep.",
    time: "as long as you need",
  },
  {
    n: "04",
    title: "Delete safely",
    body: "Selected files move to Google Drive Trash. They're recoverable for 30 days from Drive itself. Storage frees up immediately. Nothing on your end is permanent until Trash auto-empties.",
    time: "instant",
  },
];

export const FEATURES: {
  Icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
}[] = [
  {
    Icon: Layers,
    title: "Smart Duplicate Detection",
    body: "Detects exact matches via MD5 checksum, plus likely duplicates and version variants. Three confidence levels so you know what's safe to delete.",
    tag: "DETECT",
  },
  {
    Icon: Lock,
    title: "Private by Design",
    body: "No backend server. No database. Your files and credentials never leave your browser. Sign out and there is nothing to delete because nothing was ever stored.",
    tag: "PRIVATE",
  },
  {
    Icon: Eye,
    title: "Review Before Deleting",
    body: "Every duplicate group is reviewable. Inspect filenames, paths, sizes, and modified dates. Select only what you want gone — checked files are deleted, unchecked stay.",
    tag: "REVIEW",
  },
  {
    Icon: Trash2,
    title: "Safe Recovery Window",
    body: "Files move to your Google Drive Trash, not permanent deletion. Restore any file within 30 days directly from Drive if you change your mind.",
    tag: "REVERSIBLE",
  },
  {
    Icon: Zap,
    title: "Fast Scans",
    body: "Streams metadata from the Drive API and computes diffs locally. Tens of thousands of files in well under a minute. No batch jobs, no waiting in queues.",
    tag: "PERFORMANCE",
  },
  {
    Icon: Code2,
    title: "Fully Open Source",
    body: "MIT licensed. Read the code, audit the permissions, run it locally, fork it, contribute. No black box, no telemetry, no analytics scripts.",
    tag: "OPEN",
  },
];
