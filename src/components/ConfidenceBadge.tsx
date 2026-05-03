import type { ConfidenceLevel } from "../types/drive";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/cn";

const COLORS = {
	light: {
		exact: { bg: "#e8f5f2", border: "#00b894", text: "#007a5e", label: "Exact Match" },
		likely: { bg: "#fff8e6", border: "#f5a623", text: "#b8750f", label: "Likely Duplicate" },
		version: { bg: "#eff3ff", border: "#667eea", text: "#4a5bd4", label: "Possible Version" },
	},
	dark: {
		exact: {
			bg: "rgba(0,201,167,0.08)",
			border: "#00c9a7",
			text: "#00c9a7",
			label: "Exact Match",
		},
		likely: {
			bg: "rgba(245,166,35,0.08)",
			border: "#f5a623",
			text: "#f5a623",
			label: "Likely Duplicate",
		},
		version: {
			bg: "rgba(102,126,234,0.08)",
			border: "#667eea",
			text: "#8b9ef0",
			label: "Possible Version",
		},
	},
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
	const { theme } = useTheme();
	const c = COLORS[theme][level];
	return (
		<span
			className={cn(
				"rounded-sm text-[10px] font-bold tracking-[0.08em] py-[3px] px-2 uppercase font-barlow whitespace-nowrap",
				`bg-[${c.bg}] border-[1px] border-[${c.border}44] text-[${c.text}]`,
			)}
		>
			{c.label}
		</span>
	);
}
