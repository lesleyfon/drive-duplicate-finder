import { useStorageQuota } from "../hooks/useStorageQuota";
import { formatBytes, formatPercent } from "../lib/formatters";

export function StorageBar() {
	const { data, isPending, isError } = useStorageQuota();

	if (isPending) {
		return (
			<div className="px-8 py-4 border-b border-border-dim animate-pulse">
				<div className="h-3 bg-surface-high w-48 mb-3" />
				<div className="h-1 bg-surface-high w-full" />
			</div>
		);
	}

	if (isError || !data) return null;

	const pct = data.limit > 0 ? (data.usage / data.limit) * 100 : 0;
	const isNearFull = pct > 80;

	return (
		<div className="px-8 py-4 border-b border-border-dim">
			<div className="flex items-center justify-between mb-2">
				<span className="text-label uppercase tracking-widest text-text-muted">
					STORAGE USAGE
				</span>
				<span className="text-sm text-text-secondary">
					{formatBytes(data.usage)} of {formatBytes(data.limit)} &mdash;{" "}
					{formatPercent(data.usage, data.limit)} used
				</span>
			</div>
			<div className="h-1 w-full bg-surface-high border border-border-dim overflow-hidden">
				<div
					className={`h-full transition-all ${isNearFull ? "bg-status-warn" : "bg-cyan-bright"}`}
					style={{ width: `${Math.min(pct, 100)}%` }}
				/>
			</div>
		</div>
	);
}
