import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useStorageQuota } from "../hooks/useStorageQuota";
import { QuickScanCard } from "../components/QuickScanCard";
import { RecentFileActivity } from "../components/RecentFileActivity";
import { formatBytes, formatPercent } from "../lib/formatters";
import type { ScanResult } from "../types/drive";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

const ALLOCATION_SEGMENTS = [
	{ key: "image" as const, shortLabel: "IMG", fullLabel: "IMAGES", color: "#00F0FF" },
	{ key: "video" as const, shortLabel: "VID", fullLabel: "VIDEOS", color: "#00DBE9" },
	{ key: "audio" as const, shortLabel: "AUD", fullLabel: "AUDIO", color: "#007981" },
	{ key: "document" as const, shortLabel: "DOC", fullLabel: "DOCS", color: "#3B494B" },
	{ key: "other" as const, shortLabel: "OTH", fullLabel: "OTHER", color: "#2A2A2A" },
];

function getStateInfo(pct: number) {
	if (pct < 60) return { stateLabel: "OPTIMAL", stateColor: "text-status-ok" };
	if (pct < 80) return { stateLabel: "MODERATE", stateColor: "text-status-warn" };
	return { stateLabel: "CRITICAL", stateColor: "text-status-error" };
}

function DashboardPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: quota } = useStorageQuota();
	const scanResults = queryClient.getQueryData<ScanResult>(["scanResults"]) ?? null;

	const handleStartScan = () => {
		queryClient.removeQueries({ queryKey: ["scanFiles"] });
		queryClient.removeQueries({ queryKey: ["scanResults"] });
		navigate({ to: "/scan" });
	};

	const capacityPct = quota && quota.limit > 0 ? (quota.usage / quota.limit) * 100 : 0;
	const { stateLabel, stateColor } = getStateInfo(capacityPct);

	const fileGroupBytes = scanResults?.fileGroupBytes ?? null;
	const totalUsed = quota?.limit ?? 0;
	const segments = ALLOCATION_SEGMENTS.map((seg) => ({
		...seg,
		pct: fileGroupBytes ? (fileGroupBytes[seg.key] / totalUsed) * 100 : 0,
		bytes: fileGroupBytes ? fileGroupBytes[seg.key] : 0,
	}));

	const hasScan = fileGroupBytes !== null;

	return (
		<div className="flex flex-col h-full overflow-y-auto">
			{/* Page header */}
			<div className="px-8 py-5 border-b border-border-dim">
				<p className="text-label uppercase tracking-widest text-text-muted mb-1">
					CLEANUP / <span className="text-cyan-bright">STORAGE SUMMARY</span>
				</p>
				<h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
					STORAGE SUMMARY
				</h1>
			</div>

			{/* Section 1 — SYSTEM_STORAGE_OVERVIEW */}
			<section className="px-8 py-6 border-b border-border-dim">
				<div className="flex items-center gap-2 mb-5">
					<span className="w-2 h-2 bg-cyan-bright flex-shrink-0" />
					<p className="text-label uppercase tracking-widest text-text-muted">
						SYSTEM STORAGE OVERVIEW
					</p>
				</div>
				{/* GB readout row */}
				<div className="flex items-end justify-between mb-6">
					<div className="flex items-baseline gap-3">
						<span className="text-[56px] font-bold leading-none tracking-tight text-text-primary">
							{quota ? formatBytes(quota.usage) : "—"}
						</span>
						<span className="text-[28px] font-normal text-text-muted leading-none">
							/{quota ? formatBytes(quota.limit) : "—"}
						</span>
						<span className="px-3 py-1 border border-cyan-dim text-cyan-bright text-label uppercase tracking-widest ml-2">
							CAPACITY: {quota ? formatPercent(quota.usage, quota.limit) : "—"}
						</span>
					</div>
					<span className="text-label uppercase tracking-widest text-text-muted">
						STATE: <span className={stateColor}>[{stateLabel}]</span>
					</span>
				</div>

				{/* Allocation bar */}
				<div className="mb-4">
					<p className="text-label uppercase tracking-widest text-text-muted mb-2">
						ALLOCATION DISTRIBUTION
					</p>
					{hasScan ? (
						<div className="flex h-10 w-full overflow-hidden border border-border-dim">
							{segments.map((seg) => (
								<div
									key={seg.key}
									style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
									className="flex items-center justify-center flex-shrink-0 transition-all"
								>
									{seg.pct > 5 && (
										<span className="text-label uppercase tracking-widest text-ink font-semibold">
											{seg.shortLabel}
										</span>
									)}
								</div>
							))}
							<div className="flex-1 bg-surface-high flex items-center justify-center flex-shrink-0 transition-all">
								<span className="text-label uppercase tracking-widest text-gray-300k font-semibold">
									Available
								</span>
							</div>
						</div>
					) : (
						<div className="h-10 w-full border border-border-dim bg-surface-high opacity-30" />
					)}
				</div>

				{/* Stats row */}
				<div className="grid grid-cols-4 divide-x divide-border-dim mt-4">
					{segments.slice(0, 4).map((seg) => (
						<div key={seg.key} className="flex items-start gap-3 px-5 first:pl-0">
							<div
								className="w-0.5 h-full self-stretch flex-shrink-0"
								style={{ backgroundColor: seg.color }}
							/>
							<div>
								<p className="text-label uppercase tracking-widest text-text-muted mb-1">
									{seg.fullLabel}
								</p>
								<p className="text-[22px] font-bold leading-none text-text-primary">
									{hasScan ? formatBytes(seg.bytes) : "—"}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Section 2 — Middle row */}
			<section className="px-8 py-6 border-b border-border-dim">
				<div className="grid grid-cols-[1fr_1.1fr] gap-4">
					<QuickScanCard scanResults={scanResults} onStartScan={handleStartScan} />
					<RecentFileActivity scanResults={scanResults} />
				</div>
			</section>
		</div>
	);
}
