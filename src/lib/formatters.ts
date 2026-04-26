export function formatBytes(bytes: number | null): string {
	if (bytes == null) return "Unknown size";
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const val = bytes / 1024 ** i; // 1 decimal for KB and above, no decimals for bytes
	return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
	if (!iso) return "—";
	return new Intl.DateTimeFormat(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
	if (!iso) return "—";
	return new Intl.DateTimeFormat(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

export function formatPercent(used: number, total: number): string {
	if (total === 0) return "0%";
	return `${Math.round((used / total) * 100)}%`;
}
