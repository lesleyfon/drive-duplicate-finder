import type { ConfidenceLevel } from "../types/drive";

const CONFIG: Record<ConfidenceLevel, { label: string; className: string }> = {
	exact: {
		label: "EXACT MATCH",
		className: "bg-cyan-dark border border-cyan-dim text-cyan-bright",
	},
	likely: {
		label: "LIKELY DUPLICATE",
		className: "bg-[#3B2F00] border border-[#EAC324] text-[#EAC324]",
	},
	version: {
		label: "POSSIBLE VERSION",
		className: "border border-border-bright text-text-muted",
	},
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
	const { label, className } = CONFIG[level];
	return (
		<span className={`px-2 py-0.5 text-label uppercase tracking-widest ${className}`}>
			{label}
		</span>
	);
}
