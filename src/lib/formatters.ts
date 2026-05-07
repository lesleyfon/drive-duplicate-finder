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

export function formatTime(iso: string): string {
	return new Date(iso).toTimeString().slice(0, 8);
}
/**
 * The function `formatRelativeTime` takes an ISO date string as input and returns a human-readable string representing
 * the relative time difference between the current time and the input time, such as "2d ago", "3h ago", "15m ago", or "just now".
 * @param {string} iso - The `iso` parameter is a string that represents a date and time in ISO 8601 format. This format is commonly used for representing dates and times in a standardized way, such as "2023-09-15T14:30:00Z". The function `formatRelativeTime` uses this ISO string to calculate the relative time difference between the current time and the provided time, and returns a human-readable string indicating how long ago that time was (e.g., "2d ago", "3h ago", "15m ago", or "just now").
 * @returns The function `formatRelativeTime` returns a string that represents the relative time difference between the current time and the input ISO date string. The returned string can be in the format of "Xd ago" for days, "Xh ago" for hours, "Xm ago" for minutes, or "just now" if the time difference is less than a minute.
 */

export function formatRelativeTime(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const days = Math.floor(ms / 86400000);
	const hours = Math.floor(ms / 3600000);
	const minutes = Math.floor(ms / 60000);
	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return "just now";
}
/**
 * The function `getMimeLabel` takes a MIME type as input and returns a label describing the type of
 * file.
 * @param {string} mimeType - The function `getMimeLabel` takes a `mimeType` parameter as input and
 * returns a label based on the type of the MIME (Multipurpose Internet Mail Extensions) content.
 * @returns The function `getMimeLabel` returns a label based on the provided MIME type. The label
 * returned depends on the type of file associated with the MIME type.
 */

export function getMimeLabel(mimeType: string): string {
	if (mimeType === "application/pdf") return "PDF";
	if (mimeType === "application/vnd.google-apps.document") return "Google Doc";
	if (mimeType === "application/vnd.google-apps.spreadsheet")
		return "Google Sheet";
	if (mimeType === "application/vnd.google-apps.presentation")
		return "Google Slides";
	if (mimeType.includes("word") || mimeType.includes("opendocument.text"))
		return "Word Doc";
	if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
		return "Spreadsheet";
	if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
		return "Presentation";
	if (mimeType.startsWith("image/jpeg") || mimeType.startsWith("image/jpg"))
		return "JPEG";
	if (mimeType.startsWith("image/png")) return "PNG";
	if (mimeType.startsWith("image/gif")) return "GIF";
	if (mimeType.startsWith("image/")) return "Image";
	if (mimeType.startsWith("video/")) return "Video";
	if (mimeType.startsWith("audio/")) return "Audio";
	if (mimeType.startsWith("text/")) return "Text";
	if (mimeType.includes("zip") || mimeType.includes("tar")) return "Archive";
	return "File";
}

export function getMimeColor(mimeType: string): string {
	if (mimeType.startsWith("image/")) return "#00F0FF";
	if (mimeType.startsWith("video/")) return "#00DBE9";
	if (mimeType.startsWith("audio/")) return "#7AD4DD";
	if (mimeType === "application/pdf") return "#4A9EFF";
	if (mimeType.startsWith("text/")) return "#B9CACB";
	if (
		mimeType.includes("zip") ||
		mimeType.includes("tar") ||
		mimeType.includes("gzip")
	)
		return "#849495";
	return "#3B494B";
}
