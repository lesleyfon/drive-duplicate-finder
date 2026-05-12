export const PHASES = [
	{ label: "Connect to Drive", time: "~2s" },
	{ label: "Analyze files", time: "~30s" },
	{ label: "Find duplicate groups", time: "~5s" },
];

export const statsFn = ({
	totalFiles,
	matchedCount,
	exactCount,
	likelyCount,
	reclaimMB,
	throughput,
	estimatedTotal,
}: {
	totalFiles: number;
	matchedCount: number;
	exactCount: number;
	likelyCount: number;
	reclaimMB: number;
	throughput: number;
	estimatedTotal: number | null;
}) => [
	{
		label: "Objects parsed",
		value: totalFiles.toLocaleString(),
		sub:
			estimatedTotal !== null
				? `of ~${estimatedTotal.toLocaleString()}`
				: "scanning…",
		color: "var(--theme-title-text)",
	},
	{
		label: "Matches found",
		value: matchedCount.toString(),
		sub: `${exactCount} exact · ${likelyCount} likely`,
		color: "var(--theme-accent)",
	},
	{
		label: "Estimated reclaim",
		value: `${reclaimMB} MB`,
		sub: "so far",
		color: "var(--theme-large-file-size)",
	},
	{
		label: "Throughput",
		value: `${throughput}/s`,
		sub: "recent avg",
		color: "var(--theme-body-text)",
	},
];

export const footerTips = [
	[
		"Safe to leave",
		"The scan continues if you switch tabs. Come back any time.",
	],
	[
		"Resumable",
		"If the connection drops, the scan picks up from the last cached file.",
	],
	[
		"No deletions yet",
		"Nothing is modified during the scan. Reviewing comes next.",
	],
];
