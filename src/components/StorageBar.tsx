import { useStorageQuota } from "../hooks/useStorageQuota";
import { formatBytes, formatPercent } from "../lib/formatters";

export function StorageBar() {
	const { data, isPending, isError } = useStorageQuota();

	if (isPending) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
				<div className="h-4 bg-gray-200 rounded w-48 mb-3" />
				<div className="h-3 bg-gray-200 rounded w-full" />
			</div>
		);
	}

	if (isError || !data) return null;

	const pct = data.limit > 0 ? (data.usage / data.limit) * 100 : 0;
	const isNearFull = pct > 80;

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-4">
			<div className="flex justify-between items-baseline mb-2">
				<span className="text-sm font-medium text-gray-700">Storage</span>
				<span className="text-sm text-gray-500">
					{formatBytes(data.usage)} used of {formatBytes(data.limit)}
				</span>
			</div>
			<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
				<div
					className={`h-2.5 rounded-full transition-all ${isNearFull ? "bg-red-500" : "bg-blue-500"}`}
					style={{ width: `${Math.min(pct, 100)}%` }}
				/>
			</div>
			<p className="text-xs text-gray-400 mt-1">
				{formatPercent(data.usage, data.limit)} used
			</p>
		</div>
	);
}
