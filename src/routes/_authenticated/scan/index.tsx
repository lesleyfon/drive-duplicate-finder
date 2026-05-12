import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockIcon, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import { useScanFiles } from "../../../hooks/useScanFiles";
import { useScanStore } from "../../../store/scanStore";
import { footerTips, PHASES, statsFn } from "./data";

import "./style.css";

export const Route = createFileRoute("/_authenticated/scan/")({
	component: ScanPage,
});

const SEGMENTS = 40;
const LEADING = 6;

function ScanPage() {
	const navigate = useNavigate();
	const { signOut } = useGoogleAuth();

	const storeStatus = useScanStore((s) => s.status);
	const totalFiles = useScanStore((s) => s.totalFiles);
	const scanResults = useScanStore((s) => s.scanResults);
	const sessionId = useScanStore((s) => s.sessionId);
	const startedAt = useScanStore((s) => s.startedAt);
	const resetScan = useScanStore((s) => s.resetScan);

	const { isError, error, estimatedTotal } = useScanFiles(true);

	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [elapsed, setElapsed] = useState(0);
	const [throughput, setThroughput] = useState(0);
	const [waveIdx, setWaveIdx] = useState(0);

	const wasAlreadyCompleteRef = useRef(storeStatus === "complete");
	const prevRef = useRef({ count: 0, time: Date.now() });

	// Navigate to results on completion
	useEffect(() => {
		if (storeStatus !== "complete") return;
		const delay = wasAlreadyCompleteRef.current ? 0 : 800;

		const t = setTimeout(
			() => navigate({ to: "/results", search: { filter: "duplicates" } }),
			delay,
		);
		return () => clearTimeout(t);
	}, [storeStatus, navigate]);

	// 401 redirect
	useEffect(() => {
		if (isError && (error as { status?: number })?.status === 401) {
			signOut();
			navigate({ to: "/" });
		}
	}, [isError, error, signOut, navigate]);

	// Elapsed timer (fires every second while scanning)
	useEffect(() => {
		if (!startedAt || storeStatus !== "scanning") return;
		const intervalId = setInterval(
			() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
			1_000,
		);
		return () => clearInterval(intervalId);
	}, [startedAt, storeStatus]);

	// Throughput: compute rate on each totalFiles change
	useEffect(() => {
		if (totalFiles === 0) return;

		const now = Date.now();
		const timeDifferenceInSec = (now - prevRef.current.time) / 1000;

		if (timeDifferenceInSec > 0) {
			const rate = Math.round((totalFiles - prevRef.current.count) / timeDifferenceInSec);
			if (rate >= 0) {
				setThroughput(rate);
			}
			prevRef.current = { count: totalFiles, time: now };
		}
	}, [totalFiles]);

	// Indeterminate wave for full-scan mode (no estimate)
	useEffect(() => {
		if (estimatedTotal !== null) return;
		const intervalId = setInterval(() => setWaveIdx((i) => (i + 1) % SEGMENTS), 80);
		return () => clearInterval(intervalId);
	}, [estimatedTotal]);

	// --- derived values ---

	const progress =
		estimatedTotal && estimatedTotal > 0
			? Math.min(99, (totalFiles / estimatedTotal) * 100)
			: null;

	const filledCount = progress !== null ? Math.floor((progress / 100) * SEGMENTS) : 0;

	const currentPhase = storeStatus === "complete" ? 2 : totalFiles > 0 ? 1 : 0;

	const elapsedStr =
		elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

	const elapsedLabel = elapsed === 0 ? "just now" : `${elapsedStr} ago`;

	const eta =
		progress !== null && progress > 1 && elapsed > 0
			? Math.round((elapsed * (100 - progress)) / progress)
			: null;

	const etaStr =
		eta === null
			? "calculating..."
			: eta < 60
				? `~${eta}s`
				: `~${Math.floor(eta / 60)}m ${eta % 60}s`;

	const matchedCount = scanResults?.duplicateGroups.length ?? 0;
	const exactCount =
		scanResults?.duplicateGroups.filter((g) => g.confidence === "exact").length ?? 0;
	const likelyCount = matchedCount - exactCount;
	const reclaimMB = scanResults
		? Math.round(
				scanResults.duplicateGroups.reduce((s, g) => s + g.totalWastedBytes, 0) /
					(1024 * 1024),
			)
		: 0;

	const handleCancel = () => {
		resetScan();
		navigate({ to: "/dashboard" });
	};

	return (
		<div className="scan-page">
			{/* ── Sticky header ── */}
			<div className="scan-header">
				{/* Breadcrumb */}
				<div className="scan-breadcrumb">
					<span className="scan-breadcrumb-parent">Cleanup</span>
					<span className="scan-breadcrumb-sep">/</span>
					<span className="scan-breadcrumb-current">Scan</span>
				</div>

				{/* Title row */}
				<div className="scan-title-row">
					<div>
						{/* H1 + LIVE pill */}
						<h1 className="scan-h1">
							Drive Scan
							<span className="scan-live-pill">
								<span className="scan-pulse-dot scan-pulse-dot--sm" />
								LIVE
							</span>
						</h1>

						{/* Subtitle */}
						<div className="scan-subtitle">
							<span className="scan-pulse-dot scan-pulse-dot--md" />
							Scanning your Google Drive · Started {elapsedLabel}
						</div>
					</div>

					{/* Right meta */}
					<div className="scan-meta">
						<div>
							SESSION <span className="scan-meta-session">{sessionId ?? "—"}</span>
						</div>
						<div>
							ETA <span className="scan-meta-eta">{etaStr} remaining</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Grid background + content ── */}
			<div className="scan-grid-bg">
				<div className="scan-content">
					{/* ── 1. Hero progress panel ── */}
					<div className="scan-hero-panel">
						{/* Animated scan line */}
						<div className="scan-pulse-line" />

						<div className="scan-hero-body">
							{/* Progress number + cancel button */}
							<div className="scan-progress-header">
								<div>
									{/* Eyebrow */}
									<div className="scan-eyebrow">
										Step {currentPhase + 1} of {PHASES.length} ·{" "}
										{PHASES[currentPhase]?.label}
									</div>

									{/* Big number */}
									<div className="scan-big-number-row">
										<span className="scan-big-number">
											{progress !== null ? (
												<>
													{Math.floor(progress)}
													<span className="scan-percent-suffix">%</span>
												</>
											) : totalFiles > 0 ? (
												totalFiles.toLocaleString()
											) : (
												"—"
											)}
										</span>
										<div className="scan-big-number-labels">
											<div className="scan-big-number-label">
												{progress !== null ? "scanned" : "files analyzed"}
											</div>
											<div className="scan-big-number-sub">
												{estimatedTotal !== null
													? `${totalFiles.toLocaleString()} of ~${estimatedTotal.toLocaleString()} objects`
													: `${totalFiles.toLocaleString()} objects`}
											</div>
										</div>
									</div>
								</div>

								{/* Cancel button */}
								<button
									type="button"
									onClick={() => setShowCancelDialog(true)}
									className="scan-cancel-btn"
								>
									<Square
										width="11"
										height="11"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
									/>
									Cancel scan
								</button>
							</div>

							{/* Segmented progress bar */}
							<div className="scan-bar">
								{Array.from({ length: SEGMENTS }).map((_, i) => {
									if (progress !== null) {
										const filled = i < filledCount;
										const isLeading = filled && i >= filledCount - LEADING;

										return (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: Static array of fixed length used for progress bar segments
												key={i}
												className={`scan-bar-seg${isLeading ? " scan-pulse-seg" : ""}`}
												style={{
													background: filled
														? "var(--theme-accent)"
														: "var(--theme-bar-track)",
												}}
											/>
										);
									}

									const dist = (i - waveIdx + SEGMENTS) % SEGMENTS;
									const inWave = dist < LEADING;

									return (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: Static array of fixed length used for progress bar segments
											key={i}
											className="scan-bar-seg"
											style={{
												background: inWave
													? "var(--theme-accent)"
													: "var(--theme-bar-track)",
												opacity: inWave ? 1 - (dist / LEADING) * 0.55 : 1,
											}}
										/>
									);
								})}
							</div>

							{/* Tick marks */}
							<div className="scan-tick-row">
								{[0, 25, 50, 75, 100].map((label) => (
									<span key={label}>{label}%</span>
								))}
							</div>
						</div>

						{/* ── Phase strip ── */}
						<div className="scan-phase-strip">
							{PHASES.map((phase, i) => {
								const isPast = i < currentPhase;
								const isCurrent = i === currentPhase;
								const phaseState = isCurrent
									? "current"
									: isPast
										? "past"
										: "future";
								return (
									<div
										key={phase.label}
										className="scan-phase-item"
										data-phase={phaseState}
									>
										{isCurrent && <div className="scan-phase-active-line" />}
										<div className="scan-phase-header">
											<span className="scan-phase-indicator">
												{isPast ? (
													"✓"
												) : isCurrent ? (
													<span className="scan-phase-dot" />
												) : (
													i + 1
												)}
											</span>
											<span className="scan-phase-label">{phase.label}</span>
										</div>
										<div className="scan-phase-time">{phase.time}</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* ── 2. Stats grid ── */}
					<div className="scan-stats-grid">
						{statsFn({
							totalFiles,
							matchedCount,
							exactCount,
							likelyCount,
							reclaimMB,
							throughput,
							estimatedTotal,
						}).map((stat) => (
							<div key={stat.label} className="scan-stat-card">
								<div className="scan-stat-label">{stat.label}</div>
								<div className="scan-stat-value" style={{ color: stat.color }}>
									{stat.value}
								</div>
								<div className="scan-stat-sub">{stat.sub}</div>
							</div>
						))}
					</div>

					{/* ── 3. Privacy reassurance ── */}
					<div className="scan-privacy">
						<LockIcon width="18" height="18" stroke="var(--theme-accent)" />
						<div className="scan-privacy-body">
							<div className="scan-privacy-headline">
								Your files never leave your browser.
							</div>
							<div className="scan-privacy-text">
								The scan runs locally. We compare checksums from Drive metadata and
								send nothing to a server. You can close this tab anytime — there's
								nothing to clean up.
							</div>
						</div>
						<span className="scan-privacy-badge">0 BYTES SENT</span>
					</div>

					{/* ── 4. Footer tips ── */}
					<div className="scan-tips-grid">
						{footerTips.map(([title, body]) => (
							<div key={title} className="scan-tip-card">
								<div className="scan-tip-title">{title}</div>
								<div className="scan-tip-body">{body}</div>
							</div>
						))}
					</div>

					{/* Error banner */}
					{isError && (
						<div className="scan-error-banner">
							<div className="scan-error-label">Scan interrupted</div>
							<div className="scan-error-msg">
								{(error as Error)?.message ?? "Unknown error. Please retry."}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* ── Cancel confirmation dialog ── */}
			{showCancelDialog && (
				// biome-ignore lint/a11y/useKeyWithClickEvents: ignore because the dialog has a button to dismiss it
				// biome-ignore lint/a11y/noStaticElementInteractions: ignore because the dialog has a button to dismiss it
				<div onClick={() => setShowCancelDialog(false)} className="scan-dialog-overlay">
					<div
						role="dialog"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						className="scan-dialog"
					>
						<h2 className="scan-dialog-title">Cancel the scan?</h2>
						<p className="scan-dialog-body">
							You'll lose progress and need to start over. The scan cannot be resumed
							once cancelled.
						</p>
						<div className="scan-dialog-actions">
							<button
								type="button"
								onClick={() => setShowCancelDialog(false)}
								className="scan-btn-secondary"
							>
								Go back
							</button>
							<button
								type="button"
								onClick={handleCancel}
								className="scan-btn-danger"
							>
								Cancel scan
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
