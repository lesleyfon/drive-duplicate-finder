import { createFileRoute, redirect } from "@tanstack/react-router";
import { Google as GoogleIcon } from "@thesvg/react";
import {
	Check,
	Code2,
	Eye,
	Github,
	Layers,
	Lock,
	Trash2,
	Zap,
	type LucideIcon,
} from "lucide-react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import "./sign-in-buttons-styles.css";
import { cn } from "../lib/cn";

const GITHUB_URL = "https://github.com/lesleyfon/drive-duplicate-finder";
const W = "max-w-[1100px] mx-auto px-[28px]";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (context.isAuthenticated) throw redirect({ to: "/dashboard" });
	},
	component: MarketingPage,
});

/* ── Results Mockup ─────────────────────────────────────────────────── */

const MOCKUP_GROUPS = [
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

function ResultsMockup() {
	return (
		<div
			style={{
				background: "var(--theme-surface)",
				border: "1px solid var(--theme-border)",
				borderRadius: 14,
				boxShadow: "var(--theme-card-shadow)",
				overflow: "hidden",
				width: "100%",
			}}
		>
			{/* browser chrome */}
			<div
				style={{
					padding: "10px 14px",
					borderBottom: "1px solid var(--theme-border)",
					display: "flex",
					alignItems: "center",
					gap: 8,
					background: "var(--theme-surface-alt)",
				}}
			>
				<div className="flex gap-[5px]">
					{(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
						<div
							key={c}
							style={{
								width: 9,
								height: 9,
								borderRadius: 5,
								background: c,
								opacity: 0.6,
							}}
						/>
					))}
				</div>
				<div
					className="flex-1 text-center font-jetbrains"
					style={{ fontSize: 9, color: "var(--theme-text-secondary)" }}
				>
					driveduplicatecleaner.com/results
				</div>
			</div>
			{/* topbar */}
			<div
				style={{
					padding: "10px 16px",
					borderBottom: "1px solid var(--theme-border)",
					display: "flex",
					alignItems: "center",
					gap: 12,
				}}
			>
				<div
					style={{
						fontSize: 10,
						fontWeight: 700,
						color: "var(--theme-title-text)",
						letterSpacing: "0.06em",
						textTransform: "uppercase",
					}}
				>
					Duplicate Results
				</div>
				<div className="flex-1" />
				<div style={{ fontSize: 9, color: "var(--theme-text-secondary)" }}>
					<b style={{ color: "var(--theme-title-text)" }}>57</b> groups ·{" "}
					<b style={{ color: "var(--theme-accent)" }}>408 MB</b> recoverable
				</div>
				<div
					style={{
						background: "#e84040",
						color: "#fff",
						borderRadius: 4,
						fontSize: 9,
						fontWeight: 700,
						padding: "4px 10px",
						letterSpacing: "0.06em",
						textTransform: "uppercase",
					}}
				>
					Delete 12
				</div>
			</div>
			{/* groups */}
			<div
				style={{
					padding: "10px 16px",
					display: "flex",
					flexDirection: "column",
					gap: 7,
				}}
			>
				{MOCKUP_GROUPS.map((g) => (
					<div
						key={g.type}
						style={{
							border: `1px solid ${g.expanded ? "var(--theme-accent)" : "var(--theme-border)"}`,
							borderRadius: 6,
							overflow: "hidden",
							boxShadow: g.expanded ? "0 0 0 2px var(--theme-accent-bg)" : "none",
						}}
					>
						<div
							style={{
								padding: "9px 12px",
								display: "flex",
								alignItems: "center",
								gap: 10,
								borderLeft: "3px solid var(--theme-accent)",
							}}
						>
							<span
								style={{
									fontSize: 8,
									color: "var(--theme-accent)",
									fontWeight: 800,
									letterSpacing: "0.1em",
								}}
							>
								{g.type}
							</span>
							<span
								style={{
									background: "var(--theme-border-soft)",
									color: "var(--theme-text-secondary)",
									borderRadius: 2,
									fontSize: 8,
									fontWeight: 700,
									padding: "1px 5px",
								}}
							>
								{g.count}
							</span>
							<span
								style={{
									flex: 1,
									fontSize: 11,
									color: "var(--theme-body-text)",
									fontFamily: "'JetBrains Mono', monospace",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{g.name}
							</span>
							<span
								style={{
									fontSize: 12,
									fontWeight: 800,
									color: "var(--theme-accent)",
									fontFamily: "'Barlow Condensed', sans-serif",
								}}
							>
								{g.size}
							</span>
						</div>
						{g.expanded && (
							<div
								style={{
									background: "var(--theme-surface-alt)",
									padding: "6px 12px 6px 30px",
									display: "flex",
									flexDirection: "column",
									gap: 3,
									borderTop: "1px solid var(--theme-border-soft)",
								}}
							>
								{(
									[
										"report_2024.pdf",
										"report_2024 (1).pdf",
										"report_2024_v2.pdf",
									] as const
								).map((n, j) => (
									<div key={n} className="flex items-center gap-2">
										<div
											style={{
												width: 9,
												height: 9,
												border: `1.5px solid ${j < 2 ? "var(--theme-accent)" : "var(--theme-text-dim)"}`,
												background:
													j < 2 ? "var(--theme-accent)" : "transparent",
												borderRadius: 2,
											}}
										/>
										<span
											style={{
												flex: 1,
												fontSize: 9,
												color: "var(--theme-text-secondary)",
												fontFamily: "'JetBrains Mono', monospace",
											}}
										>
											{n}
										</span>
										<span
											style={{
												fontSize: 9,
												color: "var(--theme-text-secondary)",
												fontFamily: "'JetBrains Mono', monospace",
											}}
										>
											127 KB
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

/* ── Static data ────────────────────────────────────────────────────── */

const FEATURES: {
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

const STEPS = [
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

const PRIVACY_ITEMS: [string, string][] = [
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

const FAQS: [string, string][] = [
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

/* ── Sign-in button ─────────────────────────────────────────────────── */

function SignInBtn({
	onSignIn,
	label = "Sign in with Google",
	size = "default",
}: {
	onSignIn: () => void;
	label?: string;
	size?: "sm" | "default" | "lg";
}) {
	if (size === "sm") {
		return (
			<button
				type="button"
				onClick={onSignIn}
				className="font-barlow-condensed font-bold uppercase tracking-[0.06em] text-[11px] rounded-[6px] px-[14px] py-[7px] cursor-pointer border hover:opacity-90 transition-opacity"
				style={{
					background: "var(--theme-btn-bg)",
					color: "var(--theme-btn-text)",
					borderColor: "var(--theme-btn-bg)",
				}}
			>
				{label}
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={onSignIn}
			className={cn(
				"btn font-barlow-condensed font-bold uppercase tracking-[0.06em] rounded-lg flex items-center gap-[9px] cursor-pointer hover:opacity-90 transition-opacity",
				size === "lg" ? "px-7 py-[15px] text-[14px]" : "px-[22px] py-[13px] text-[13px]",
			)}
			style={{
				background: "var(--theme-btn-bg)",
				color: "var(--theme-btn-text)",
				borderColor: "var(--theme-btn-bg)",
			}}
		>
			<GoogleIcon className="w-[18px] h-[18px] shrink-0" />
			{label}
		</button>
	);
}

/* ── Marketing Page ─────────────────────────────────────────────────── */

function MarketingPage() {
	const { signIn } = useGoogleAuth();

	return (
		<div style={{ fontFamily: "'Barlow', sans-serif" }}>
			{/* ── NAV ── */}
			<nav
				style={{
					position: "sticky",
					top: 0,
					zIndex: 10,
					background: "var(--theme-nav-bg)",
					backdropFilter: "blur(8px)",
					borderBottom: "1px solid var(--theme-border)",
				}}
			>
				<div className={cn(W, "flex items-center gap-6 py-3")}>
					<a href="#top" className="flex items-center gap-[10px] no-underline">
						<div
							className="w-7 h-7 rounded-[7px] flex items-center justify-center"
							style={{ background: "var(--theme-accent)" }}
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="var(--theme-btn-text)"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<polygon points="12 2 2 7 12 12 22 7 12 2" />
								<polyline points="2 17 12 22 22 17" />
							</svg>
						</div>
						<div>
							<div
								className="font-barlow-condensed font-black uppercase text-[13px] leading-none tracking-[0.02em]"
								style={{ color: "var(--theme-title-text)" }}
							>
								Drive Duplicate Cleaner
							</div>
							<div
								className="font-barlow-condensed font-bold uppercase text-[8px] tracking-[0.12em] mt-[2px]"
								style={{ color: "var(--theme-text-secondary)" }}
							>
								FREE · OPEN SOURCE
							</div>
						</div>
					</a>
					<div className="flex-1" />
					<div className="flex gap-[22px]">
						{(
							[
								["Features", "#features"],
								["How it works", "#how-it-works"],
								["Privacy", "#privacy"],
								["FAQ", "#faq"],
							] as const
						).map(([label, href]) => (
							<a
								key={href}
								href={href}
								className="text-[11px] font-semibold uppercase tracking-[0.04em] no-underline hover:opacity-80 transition-opacity"
								style={{ color: "var(--theme-text-secondary)" }}
							>
								{label}
							</a>
						))}
					</div>
					<a
						href={GITHUB_URL}
						className="flex items-center gap-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] no-underline hover:opacity-80 transition-opacity"
						style={{ color: "var(--theme-text-secondary)" }}
					>
						<Github size={14} aria-hidden="true" /> GITHUB
					</a>
					<SignInBtn onSignIn={signIn} label="Sign in" size="sm" />
				</div>
			</nav>

			{/* ── HERO ── */}
			<header
				id="top"
				style={{
					borderBottom: "1px solid var(--theme-border)",
					position: "relative",
					overflow: "hidden",
					background:
						"linear-gradient(180deg, var(--theme-page-bg) 0%, var(--theme-surface-alt) 100%)",
				}}
			>
				<div
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage:
							"linear-gradient(var(--theme-grid-overlay) 1px, transparent 1px), linear-gradient(90deg, var(--theme-grid-overlay) 1px, transparent 1px)",
						backgroundSize: "32px 32px",
						opacity: 0.6,
						pointerEvents: "none",
					}}
				/>
				<div
					className={cn(W, "grid gap-[40px] items-center relative py-[60px] pb-[50px]")}
					style={{ gridTemplateColumns: "1.1fr 1fr" }}
				>
					<div>
						{/* pill */}
						<div
							className="inline-flex items-center gap-[7px] rounded-full mb-[22px] px-[11px] py-[5px]"
							style={{
								border: "1px solid var(--theme-accent-border)",
								background: "var(--theme-accent-bg)",
							}}
						>
							<div
								className="w-[6px] h-[6px] rounded-full"
								style={{ background: "var(--theme-accent)" }}
							/>
							<span
								className="text-[10px] font-bold uppercase tracking-[0.12em]"
								style={{ color: "var(--theme-accent)" }}
							>
								Free · Open Source · No Backend
							</span>
						</div>
						<h1
							className="font-barlow-condensed font-black uppercase leading-[0.95] tracking-[-0.015em] mb-[18px]"
							style={{ fontSize: 64, color: "var(--theme-title-text)" }}
						>
							Find &amp; Remove
							<br />
							<span style={{ color: "var(--theme-accent)" }}>Duplicate Files</span>
							<br />
							In Google Drive
						</h1>
						<p
							className="mb-7 leading-[1.55] font-barlow"
							style={{
								fontSize: 17,
								color: "var(--theme-body-text)",
								maxWidth: 460,
							}}
						>
							The fastest way to free up Google Drive storage. Scans your Drive for
							duplicates, shows exactly what's recoverable, and lets you delete safely
							— all in your browser. No server. No data stored.
						</p>
						<div className="flex gap-[10px] mb-[22px]">
							<SignInBtn onSignIn={signIn} />
							<a
								href="#how-it-works"
								className="font-barlow-condensed font-bold uppercase tracking-[0.06em] text-[13px] rounded-lg px-[22px] py-[13px] cursor-pointer border no-underline flex items-center hover:opacity-80 transition-opacity"
								style={{
									background: "var(--theme-btn-secondary-bg)",
									color: "var(--theme-btn-secondary-text)",
									borderColor: "var(--theme-btn-secondary-border)",
								}}
							>
								See how it works ↓
							</a>
						</div>
						<div className="flex gap-[18px] flex-wrap">
							{(["Free forever", "100% browser-based", "MIT licensed"] as const).map(
								(x) => (
									<div
										key={x}
										className="flex items-center gap-[6px] text-[11px] font-semibold"
										style={{ color: "var(--theme-text-secondary)" }}
									>
										<span style={{ color: "var(--theme-accent)" }}>
											<Check size={14} aria-hidden="true" />
										</span>{" "}
										{x}
									</div>
								),
							)}
						</div>
					</div>
					<div
						style={{
							transform: "perspective(1400px) rotateY(-7deg) rotateX(3deg)",
							transformOrigin: "left center",
						}}
					>
						<ResultsMockup />
					</div>
				</div>

				{/* stat strip */}
				<div
					style={{
						borderTop: "1px solid var(--theme-border)",
						background: "var(--theme-surface)",
					}}
				>
					<div
						className={cn(W, "grid py-[18px] gap-6")}
						style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
					>
						{(
							[
								["2.4 GB", "average recoverable per scan"],
								["< 30 sec", "to scan 5,000 files"],
								["0 bytes", "leave your browser"],
								["100%", "open source"],
							] as const
						).map(([v, l], i) => (
							<div
								key={l}
								style={{
									borderLeft:
										i > 0 ? "1px solid var(--theme-border-soft)" : "none",
									paddingLeft: i > 0 ? 24 : 0,
								}}
							>
								<div
									className="font-barlow-condensed font-black tracking-[-0.01em] leading-none"
									style={{ fontSize: 28, color: "var(--theme-title-text)" }}
								>
									{v}
								</div>
								<div
									className="font-bold uppercase tracking-[0.1em] mt-[5px]"
									style={{ fontSize: 10, color: "var(--theme-text-secondary)" }}
								>
									{l}
								</div>
							</div>
						))}
					</div>
				</div>
			</header>

			{/* ── FEATURES ── */}
			<section id="features" className={cn(W, "py-[80px]")}>
				<div className="text-center mb-[50px]">
					<div
						className="font-bold uppercase tracking-[0.18em] mb-[10px]"
						style={{ fontSize: 10, color: "var(--theme-accent)" }}
					>
						What it does
					</div>
					<h2
						className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-[14px]"
						style={{ fontSize: 44, color: "var(--theme-title-text)" }}
					>
						Everything you need to{" "}
						<span style={{ color: "var(--theme-accent)" }}>clean up Drive</span>
					</h2>
					<p
						style={{
							fontSize: 15,
							color: "var(--theme-text-secondary)",
							maxWidth: 540,
							margin: "0 auto",
							lineHeight: 1.55,
						}}
					>
						Built for people who want their storage back without giving a third-party
						vendor unrestricted access to their files.
					</p>
				</div>
				<div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
					{FEATURES.map(({ Icon, title, body, tag }) => (
						<article
							key={tag}
							className="rounded-xl p-[22px_22px_24px]"
							style={{
								background: "var(--theme-surface)",
								border: "1px solid var(--theme-border)",
								boxShadow: "var(--theme-card-shadow)",
							}}
						>
							<div className="flex items-center justify-between mb-[14px]">
								<div
									className="w-9 h-9 rounded-lg flex items-center justify-center"
									style={{
										background: "var(--theme-accent-dim)",
										border: "1px solid var(--theme-accent-border)",
										color: "var(--theme-accent)",
									}}
								>
									<Icon size={20} aria-hidden="true" />
								</div>
								<span
									className="font-jetbrains font-bold tracking-[0.14em]"
									style={{ fontSize: 9, color: "var(--theme-text-secondary)" }}
								>
									{tag}
								</span>
							</div>
							<h3
								className="font-barlow-condensed font-extrabold uppercase tracking-[0.01em] leading-[1.1] mb-2"
								style={{ fontSize: 18, color: "var(--theme-title-text)" }}
							>
								{title}
							</h3>
							<p
								style={{
									fontSize: 13,
									color: "var(--theme-body-text)",
									lineHeight: 1.55,
								}}
							>
								{body}
							</p>
						</article>
					))}
				</div>
			</section>

			{/* ── HOW IT WORKS ── */}
			<section
				id="how-it-works"
				style={{
					background: "var(--theme-surface)",
					borderTop: "1px solid var(--theme-border)",
					borderBottom: "1px solid var(--theme-border)",
				}}
			>
				<div className={cn(W, "py-[80px]")}>
					<div
						className="grid gap-[60px] items-start"
						style={{ gridTemplateColumns: "1fr 1.4fr" }}
					>
						<div style={{ position: "sticky", top: 80 }}>
							<div
								className="font-bold uppercase tracking-[0.18em] mb-[10px]"
								style={{ fontSize: 10, color: "var(--theme-accent)" }}
							>
								How it works
							</div>
							<h2
								className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-[18px]"
								style={{ fontSize: 44, color: "var(--theme-title-text)" }}
							>
								Four steps.{" "}
								<span style={{ color: "var(--theme-accent)" }}>Zero risk.</span>
							</h2>
							<p
								className="mb-[22px] leading-[1.6] font-barlow"
								style={{ fontSize: 14, color: "var(--theme-body-text)" }}
							>
								From sign-in to recovered storage in under five minutes. The app
								reads metadata, finds matches, lets you pick what to delete, and
								moves selected files to Drive's Trash — where they're recoverable
								for 30 days.
							</p>
							<SignInBtn onSignIn={signIn} label="Try it now" />
						</div>
						<ol className="list-none flex flex-col gap-[14px]">
							{STEPS.map(({ n, title, body, time }) => (
								<li
									key={n}
									className="rounded-lg p-[20px_24px] grid gap-[18px] items-start"
									style={{
										background: "var(--theme-surface-alt)",
										border: "1px solid var(--theme-border)",
										borderLeft: "4px solid var(--theme-accent)",
										gridTemplateColumns: "60px 1fr auto",
									}}
								>
									<div
										className="font-barlow-condensed font-black leading-none tracking-[-0.02em]"
										style={{ fontSize: 30, color: "var(--theme-accent)" }}
									>
										{n}
									</div>
									<div>
										<h3
											className="font-barlow-condensed font-extrabold uppercase tracking-[0.02em] leading-[1.15] mb-[6px]"
											style={{
												fontSize: 17,
												color: "var(--theme-title-text)",
											}}
										>
											{title}
										</h3>
										<p
											style={{
												fontSize: 13,
												color: "var(--theme-body-text)",
												lineHeight: 1.55,
											}}
										>
											{body}
										</p>
									</div>
									<span
										className="font-jetbrains font-bold uppercase tracking-[0.1em] whitespace-nowrap rounded-sm px-2 py-[3px]"
										style={{
											fontSize: 9,
											color: "var(--theme-text-secondary)",
											border: "1px solid var(--theme-border)",
										}}
									>
										{time}
									</span>
								</li>
							))}
						</ol>
					</div>
				</div>
			</section>

			{/* ── PRIVACY ── */}
			<section id="privacy" className={cn(W, "py-[80px]")}>
				<div
					className="rounded-[14px] overflow-hidden grid"
					style={{
						background: "var(--theme-surface)",
						border: "1px solid var(--theme-border)",
						boxShadow: "var(--theme-card-shadow)",
						gridTemplateColumns: "1fr 1fr",
					}}
				>
					<div
						className="p-[44px_40px]"
						style={{ borderRight: "1px solid var(--theme-border)" }}
					>
						<div
							className="inline-flex items-center gap-[7px] px-[10px] py-1 rounded mb-[18px]"
							style={{
								background: "var(--theme-accent-dim)",
								border: "1px solid var(--theme-accent-border)",
								color: "var(--theme-accent)",
							}}
						>
							<Lock size={20} aria-hidden="true" />
							<span
								className="font-extrabold uppercase tracking-[0.14em]"
								style={{ fontSize: 10, color: "var(--theme-accent)" }}
							>
								Privacy
							</span>
						</div>
						<h2
							className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-4"
							style={{ fontSize: 36, color: "var(--theme-title-text)" }}
						>
							Your files{" "}
							<span style={{ color: "var(--theme-accent)" }}>never leave</span> your
							browser.
						</h2>
						<p
							className="leading-[1.6] font-barlow"
							style={{ fontSize: 14, color: "var(--theme-body-text)" }}
						>
							Most cleanup tools route your Drive through their servers. We don't have
							servers. Open the network tab — every request goes to{" "}
							<code
								className="font-jetbrains rounded-sm px-[5px] py-[1px]"
								style={{ fontSize: 12, background: "var(--theme-border-soft)" }}
							>
								googleapis.com
							</code>{" "}
							or to load this page itself. Nothing else.
						</p>
					</div>
					<div className="p-[44px_40px] flex flex-col gap-[14px]">
						{PRIVACY_ITEMS.map(([title, body]) => (
							<div
								key={title}
								className="grid gap-[14px]"
								style={{ gridTemplateColumns: "auto 1fr" }}
							>
								<div
									className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-[2px]"
									style={{
										background: "var(--theme-accent)",
										color: "var(--theme-btn-text)",
									}}
								>
									<Check size={12} aria-hidden="true" />
								</div>
								<div>
									<h3
										className="font-bold mb-1"
										style={{ fontSize: 14, color: "var(--theme-title-text)" }}
									>
										{title}
									</h3>
									<p
										style={{
											fontSize: 12.5,
											color: "var(--theme-body-text)",
											lineHeight: 1.5,
										}}
									>
										{body}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── FAQ ── */}
			<section
				id="faq"
				style={{
					borderTop: "1px solid var(--theme-border)",
					background: "var(--theme-surface-alt)",
				}}
			>
				<div className="max-w-[820px] mx-auto px-[28px] py-[80px]">
					<div className="text-center mb-[44px]">
						<div
							className="font-bold uppercase tracking-[0.18em] mb-[10px]"
							style={{ fontSize: 10, color: "var(--theme-accent)" }}
						>
							FAQ
						</div>
						<h2
							className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em]"
							style={{ fontSize: 40, color: "var(--theme-title-text)" }}
						>
							Common questions
						</h2>
					</div>
					<div className="flex flex-col gap-2">
						{FAQS.map(([q, a]) => (
							<details
								key={q}
								className="rounded-lg px-[18px] py-[14px]"
								style={{
									background: "var(--theme-surface)",
									border: "1px solid var(--theme-border)",
								}}
							>
								<summary
									className="cursor-pointer font-bold flex items-center justify-between gap-3"
									style={{ fontSize: 15, color: "var(--theme-title-text)" }}
								>
									<span>{q}</span>
									<span
										style={{
											fontSize: 18,
											color: "var(--theme-accent)",
											fontWeight: 400,
										}}
									>
										+
									</span>
								</summary>
								<p
									className="mt-[10px] leading-[1.6]"
									style={{ fontSize: 13, color: "var(--theme-body-text)" }}
								>
									{a}
								</p>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* ── OPEN SOURCE CTA ── */}
			<section style={{ borderTop: "1px solid var(--theme-border)" }}>
				<div className={cn(W, "py-[70px]")}>
					<div
						className="rounded-[14px] p-[44px_48px] grid gap-[30px] items-center relative overflow-hidden"
						style={{
							background: "var(--theme-title-text)",
							gridTemplateColumns: "1.2fr 1fr",
						}}
					>
						<div
							className="absolute font-barlow-condensed font-black leading-none pointer-events-none select-none"
							style={{
								top: -20,
								right: -20,
								fontSize: 240,
								color: "var(--theme-accent)",
								opacity: 0.08,
							}}
						>
							MIT
						</div>
						<div className="relative">
							<div
								className="font-bold uppercase tracking-[0.18em] mb-[10px]"
								style={{ fontSize: 10, color: "var(--theme-accent)" }}
							>
								Open Source
							</div>
							<h2
								className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-[14px]"
								style={{ fontSize: 38, color: "var(--theme-page-bg)" }}
							>
								Read the code.{" "}
								<span style={{ color: "var(--theme-accent)" }}>
									Run it yourself.
								</span>
							</h2>
							<p
								className="leading-[1.6]"
								style={{
									fontSize: 14,
									color: "var(--theme-page-bg)",
									opacity: 0.75,
								}}
							>
								Star it, fork it, audit the OAuth scopes, host your own copy.
								Contributions are welcome — bug reports, scan optimizations, new
								file-type heuristics, additional languages.
							</p>
						</div>
						<div className="relative flex flex-col gap-[10px]">
							<a
								href={GITHUB_URL}
								className="font-barlow-condensed font-bold uppercase tracking-[0.06em] text-[13px] rounded-lg px-[22px] py-[14px] flex items-center justify-center gap-[9px] no-underline cursor-pointer hover:opacity-90 transition-opacity"
								style={{
									background: "var(--theme-accent)",
									color: "var(--theme-btn-text)",
								}}
							>
								<Github size={14} aria-hidden="true" /> View on GitHub
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* ── FINAL CTA ── */}
			<section
				className="text-center"
				style={{
					borderTop: "1px solid var(--theme-border)",
					background:
						"linear-gradient(180deg, var(--theme-surface-alt) 0%, var(--theme-page-bg) 100%)",
				}}
			>
				<div className={cn(W, "py-[80px]")}>
					<h2
						className="font-barlow-condensed font-black uppercase leading-[0.95] tracking-[-0.015em] mb-4"
						style={{ fontSize: 56, color: "var(--theme-title-text)" }}
					>
						Get your <span style={{ color: "var(--theme-accent)" }}>storage back.</span>
					</h2>
					<p
						className="mb-[26px] leading-[1.5] mx-auto font-barlow"
						style={{
							fontSize: 16,
							color: "var(--theme-body-text)",
							maxWidth: 480,
						}}
					>
						One click sign-in. Scan in 30 seconds. Delete duplicates. Done. No account,
						no email, no card.
					</p>
					<div className="flex justify-center mb-[14px]">
						<SignInBtn onSignIn={signIn} label="Sign in with Google · Free" size="lg" />
					</div>
					<div style={{ fontSize: 11, color: "var(--theme-text-secondary)" }}>
						You may see an &ldquo;unverified app&rdquo; warning. Click{" "}
						<b style={{ color: "var(--theme-body-text)" }}>Advanced → Continue</b>.
					</div>
				</div>
			</section>

			{/* ── FOOTER ── */}
			<footer
				style={{
					borderTop: "1px solid var(--theme-border)",
					background: "var(--theme-surface)",
				}}
			>
				<div className={cn(W, "pt-[40px] pb-[28px]")}>
					<div
						className="grid gap-8 mb-7"
						style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
					>
						<div>
							<div
								className="font-barlow-condensed font-black uppercase tracking-[0.02em] leading-[1.05] mb-2"
								style={{ fontSize: 16, color: "var(--theme-accent)" }}
							>
								Drive Duplicate
								<br />
								Cleaner
							</div>
							<p
								style={{
									fontSize: 12,
									color: "var(--theme-text-secondary)",
									lineHeight: 1.55,
									maxWidth: 280,
								}}
							>
								Free, open-source, browser-based duplicate finder for Google Drive.
								MIT licensed.
							</p>
						</div>
						{(
							[
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
							] as [string, [string, string][]][]
						).map(([title, items]) => (
							<div key={title as string}>
								<div
									className="font-extrabold uppercase tracking-[0.14em] mb-[10px]"
									style={{ fontSize: 9, color: "var(--theme-text-secondary)" }}
								>
									{title}
								</div>
								<div className="flex flex-col gap-[7px]">
									{items.map(([label, href]) => (
										<a
											key={label}
											href={href}
											className="no-underline hover:opacity-80 transition-opacity"
											style={{
												fontSize: 12,
												color: "var(--theme-body-text)",
											}}
										>
											{label}
										</a>
									))}
								</div>
							</div>
						))}
					</div>
					<div
						className="flex justify-between items-center flex-wrap gap-[10px] pt-[18px]"
						style={{ borderTop: "1px solid var(--theme-border-soft)" }}
					>
						<span style={{ fontSize: 11, color: "var(--theme-text-secondary)" }}>
							© 2026 Drive Duplicate Cleaner · MIT License
						</span>
						<span
							className="font-jetbrains"
							style={{ fontSize: 10, color: "var(--theme-text-dim)" }}
						>
							v0.1.0 · build 2026.05
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
