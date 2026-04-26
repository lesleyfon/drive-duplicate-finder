import type { ConfidenceLevel } from "../types/drive";

const CONFIG: Record<ConfidenceLevel, { label: string; className: string }> = {
	exact: {
		label: "Exact Match",
		className: "bg-green-100 text-green-800 border-green-200",
	},
	likely: {
		label: "Likely Duplicate",
		className: "bg-yellow-100 text-yellow-800 border-yellow-200",
	},
	version: {
		label: "Possible Version",
		className: "bg-gray-100 text-gray-700 border-gray-200",
	},
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
	const { label, className } = CONFIG[level];
	return (
		<span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
			{label}
		</span>
	);
}
