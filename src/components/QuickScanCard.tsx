import { RefreshCw, ScanLine } from "lucide-react";
import { formatDate } from "../lib/formatters";
import type { ScanResult } from "../types/drive";

interface Props {
	scanResults: ScanResult | null;
	onStartScan: () => void;
}

export function QuickScanCard({ scanResults, onStartScan }: Props) {
	// TODO: verify duplicate count — should equal total excess files across all groups
	const duplicateCount = scanResults
		? scanResults.duplicateGroups.reduce((n, g) => n + g.files.length - 1, 0)
		: null;

	return (
		<div className="rounded-xl flex flex-col p-6 bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] border-l-4 border-l-[var(--theme-accent)] shadow-[var(--theme-card-shadow)]">
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1 mr-3">
					<h2 className="font-barlow-condensed font-black uppercase tracking-[0.1em] mb-2 text-[13px] text-[var(--theme-accent)]">
						QUICK SCAN V2
					</h2>
					<p className="text-[12px] leading-relaxed text-[var(--theme-text-secondary)] max-w-[220px]">
						Locate duplicate assets, temporary data, and abandoned clusters in your
						Drive.
					</p>
				</div>
				<div className="shrink-0 flex items-center justify-center rounded w-8 h-8 border border-[var(--theme-card-border)]">
					<ScanLine className="w-10 h-10 text-border-bright flex-shrink-0" />
				</div>
			</div>

			<div className="flex-1" />

			{/* Stats row */}
			<div className="flex gap-4 pt-3 mb-4 border-t border-t-[var(--theme-card-border)]">
				<div>
					<p className="text-[9px] font-bold uppercase font-barlow-condensed mb-0.5 text-[var(--theme-text-dim)]">
						LAST SCAN
					</p>
					<p className="text-[12px] font-semibold font-jetbrains text-[var(--theme-body-text)]">
						{scanResults ? formatDate(scanResults.scannedAt.toISOString()) : "—"}
					</p>
				</div>
				<div>
					<p className="text-[9px] font-bold uppercase font-barlow-condensed mb-0.5 text-[var(--theme-text-dim)]">
						OBJECTS
					</p>
					<p className="text-[12px] font-semibold font-jetbrains text-[var(--theme-body-text)]">
						{scanResults ? scanResults.totalFilesScanned.toLocaleString() : "—"}
					</p>
				</div>
				<div>
					<p className="text-[9px] font-bold uppercase font-barlow-condensed mb-0.5 text-[var(--theme-text-dim)]">
						DUPLICATES
					</p>
					<p className="text-[12px] font-semibold font-jetbrains text-[var(--theme-accent)]">
						{duplicateCount !== null ? duplicateCount.toLocaleString() : "—"}
					</p>
				</div>
			</div>
			<button
				type="button"
				onClick={onStartScan}
				className="w-full flex items-center justify-center gap-2 font-barlow-condensed font-black uppercase transition-opacity hover:opacity-90 bg-[var(--theme-accent)] text-[var(--theme-accent-contrast)] rounded-[7px] py-[11px] text-[11px] tracking-[0.1em] border-none cursor-pointer"
			>
				<RefreshCw size={14} />
				{scanResults ? "RE-EXECUTE SCAN" : "EXECUTE SCAN"}
			</button>
		</div>
	);
}
