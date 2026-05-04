import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useStorageQuota } from "../hooks/useStorageQuota";
import { QuickScanCard } from "../components/QuickScanCard";
import { RecentFileActivity } from "../components/RecentFileActivity";
import { formatBytes, formatPercent } from "../lib/formatters";
import { useScanStore } from "../store/scanStore";
import { cn } from "../lib/cn";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

const ALLOCATION_SEGMENTS = [
	{ key: "image" as const, label: "IMAGES", color: "#00F0FF" },
	{ key: "video" as const, label: "VIDEOS", color: "#f5a623" },
	{ key: "audio" as const, label: "AUDIO", color: "#667eeae6" },
	{ key: "document" as const, label: "DOCS", color: "#3B494B" },
];

type StorageState = "HEALTHY" | "MODERATE" | "HIGH";

function getStateInfo(pct: number): { label: StorageState; color: string } {
	if (pct >= 80) return { label: "HIGH", color: "#e84040" };
	if (pct >= 60) return { label: "MODERATE", color: "#f5a623" };
	return { label: "HEALTHY", color: "var(--theme-accent)" };
}

function StateBadge({ label, color }: { label: string; color: string }) {
	return (
		<span
			// background, border, and color depend on the dynamic `color` prop
			// and use color-mix() — these must remain as inline styles
			className="font-barlow-condensed uppercase rounded py-1 px-[10px] text-[10px] font-extrabold tracking-[0.12em]"
			style={{
				background: `color-mix(in srgb, ${color} 10%, transparent)`,
				border: `1px solid color-mix(in srgb, ${color} 27%, transparent)`,
				color,
			}}
		>
			{label}
		</span>
	);
}

function DashboardPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: quota } = useStorageQuota();
	const scanResults = useScanStore((s) => s.scanResults);

	const handleStartScan = () => {
		queryClient.removeQueries({ queryKey: ["scanFiles"] });
		useScanStore.getState().resetScan();
		navigate({ to: "/scan" });
	};

	const capacityPct = quota && quota.limit > 0 ? (quota.usage / quota.limit) * 100 : 0;
	const { label: stateLabel, color: stateColor } = getStateInfo(capacityPct);

	const fileGroupBytes = scanResults?.fileGroupBytes ?? null;
	const totalBytes = quota?.limit ?? 0;
	const segments = ALLOCATION_SEGMENTS.map((seg) => ({
		...seg,
		pct: fileGroupBytes && totalBytes > 0 ? (fileGroupBytes[seg.key] / totalBytes) * 100 : 0,
		bytes: fileGroupBytes ? fileGroupBytes[seg.key] : 0,
	}));
	const hasScan = fileGroupBytes !== null;

	return (
		<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
			{/* Top Bar */}
			<div className="h-14 px-8 flex items-center border-b shrink-0 bg-[var(--theme-topbar-bg)] border-b-[var(--theme-topbar-border)]">
				<p className="text-[11px] font-semibold uppercase tracking-[0.08em] font-barlow-condensed">
					<span className="text-[var(--theme-text-dim)]">CLEANUP</span>
					<span className="text-[var(--theme-text-dim)]"> / </span>
					<span className="font-bold text-[var(--theme-accent)]">STORAGE SUMMARY</span>
				</p>
			</div>

			{/* Page content */}
			<div className="flex-1 overflow-y-auto py-7 px-8">
				{/* Page Title Row */}
				<div className="flex items-end justify-between mb-5">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1 font-barlow-condensed text-[var(--theme-text-secondary)]">
							System Storage Overview
						</p>
						<h1 className="font-barlow-condensed font-black uppercase leading-none text-[38px] tracking-[-0.01em] text-[var(--theme-text-primary)]">
							STORAGE SUMMARY
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-bold uppercase font-barlow-condensed text-[var(--theme-text-secondary)]">
							STATE
						</span>
						<StateBadge label={stateLabel} color={stateColor} />
					</div>
				</div>

				{/* Hero Storage Card */}
				<div
					className="rounded-xl mb-4 py-6 px-7 bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] shadow-[var(--theme-card-shadow)]"
					style={{ borderLeft: `4px solid ${stateColor}` }}
				>
					{/* Used / Total */}
					<div className="flex items-end gap-3 mb-5">
						<span className="font-barlow-condensed font-black leading-none text-[52px] tracking-[-0.02em] text-[var(--theme-text-primary)]">
							{quota ? formatBytes(quota.usage) : "—"}
						</span>
						<span className="font-barlow-condensed font-semibold leading-none pb-1 text-[20px] text-[var(--theme-text-secondary)]">
							/ {quota ? formatBytes(quota.limit) : "—"}
						</span>
						<div className="pb-1">
							<StateBadge
								label={`CAPACITY: ${quota ? formatPercent(quota.usage, quota.limit) : "—"}`}
								color={stateColor}
							/>
						</div>
					</div>

					{/* Allocation Distribution bar */}
					<div className="mb-5">
						<p className="text-[9px] font-bold uppercase tracking-[0.14em] mb-2 font-barlow-condensed text-[var(--theme-text-secondary)]">
							ALLOCATION DISTRIBUTION
						</p>
						{hasScan ? (
							<>
								<div className="w-full flex overflow-hidden h-2 rounded bg-[var(--theme-border)]">
									{segments.map((seg) => (
										// width and background are dynamic per-segment — must stay inline
										<div
											key={seg.key}
											className="shrink-0"
											style={{
												width: `${seg.pct}%`,
												background: seg.color,
											}}
										/>
									))}
								</div>
								<div className="flex mt-2 gap-5">
									{segments.map((seg) => (
										<div key={seg.key} className="flex items-center gap-1">
											<span
												className="inline-block w-2 h-2 rounded-[2px] shrink-0"
												style={{ background: seg.color }}
											/>
											<span className="text-[10px] font-semibold uppercase tracking-[0.06em] font-barlow-condensed text-[var(--theme-text-secondary)]">
												{seg.label}
											</span>
										</div>
									))}
								</div>
							</>
						) : (
							<div className="w-full opacity-30 h-2 rounded bg-[var(--theme-border)]" />
						)}
					</div>

					{/* Breakdown columns */}
					<div className="grid grid-cols-4">
						{segments.map((seg, i) => (
							<div
								key={seg.key}
								className={cn(
									i > 0
										? "pl-5 border-l border-l-[var(--theme-card-border)]"
										: "",
								)}
							>
								<p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-1 font-barlow-condensed text-[var(--theme-text-secondary)]">
									{seg.label}
								</p>
								<p
									className="font-barlow-condensed font-black leading-none text-[24px]"
									style={{ color: seg.color }}
								>
									{hasScan ? formatBytes(seg.bytes) : "—"}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Grid */}
				<div className="grid gap-4 grid-cols-[1fr_1.6fr]">
					<QuickScanCard scanResults={scanResults} onStartScan={handleStartScan} />
					<RecentFileActivity scanResults={scanResults} />
				</div>
			</div>
		</div>
	);
}
