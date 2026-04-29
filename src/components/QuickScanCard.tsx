import { ScanLine } from "lucide-react";
import { formatDate } from "../lib/formatters";
import type { ScanResult } from "../types/drive";

interface Props {
	scanResults: ScanResult | null;
	onStartScan: () => void;
}

export function QuickScanCard({ scanResults, onStartScan }: Props) {
	return (
		<div className="border border-border-dim bg-surface-low flex flex-col h-full">
			<div className="px-5 pt-5 pb-4 flex items-start justify-between">
				<div>
					<h2 className="text-nav uppercase tracking-widest text-cyan-bright mb-2">
						QUICK_SCAN_V2
					</h2>
					<p className="text-sm text-text-secondary leading-relaxed max-w-xs">
						LOCATE DUPLICATE ASSETS, TEMPORARY DATA STRUCTURES, AND ABANDONED
						CLUSTERS IN &lt;0.4S.
					</p>
				</div>
				<ScanLine className="w-10 h-10 text-border-bright flex-shrink-0 ml-4 mt-1" />
			</div>

			<div className="flex-1" />

			{scanResults && (
				<div className="px-5 pb-3">
					<p className="text-label uppercase tracking-widest text-text-muted">
						LAST_SCAN:{" "}
						<span className="text-text-secondary">
							{formatDate(scanResults.scannedAt.toISOString())}
						</span>
						{" · "}
						<span className="text-text-secondary">
							{scanResults.totalFilesScanned.toLocaleString()} OBJECTS
						</span>
					</p>
				</div>
			)}

			<div className="px-5 pb-5">
				<button
					type="button"
					onClick={onStartScan}
					className="w-full py-3 border border-cyan-bright text-cyan-bright text-label uppercase tracking-widest font-semibold hover:bg-cyan-bright hover:text-ink transition-colors flex items-center justify-center gap-2"
				>
					<ScanLine size={14} />
					{scanResults ? "RE-EXECUTE_SCAN" : "EXECUTE_SCAN"}
				</button>
			</div>
		</div>
	);
}
