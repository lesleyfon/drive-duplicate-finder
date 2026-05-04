import { classifyMime } from "./deduplicator";

export const TYPE_COLORS: Record<string, { light: string; dark: string; text: string }> = {
	video: { light: "#fde8e8", dark: "#2d1515", text: "#f5a623" },
	audio: { light: "#fff8e6", dark: "#221a08", text: "#667eeae6" },
	document: { light: "#e8f7f1", dark: "#102918", text: "#00c48c" },
	image: { light: "#e8f9fd", dark: "#0b1f22", text: "#00f0ff" },
	other: { light: "#f0f0f0", dark: "#1a1a1a", text: "#849495" },
};

export function getTypeStyle(
	mimeType: string,
	theme: "light" | "dark",
): { bg: string; text: string } {
	const family = classifyMime(mimeType);
	const classStyle = TYPE_COLORS[family];

	if (classStyle) {
		return { bg: classStyle[theme], text: classStyle.text };
	}
	return {
		bg: theme === "light" ? "var(--theme-count-badge-bg)" : "var(--theme-border)",
		text: "var(--theme-text-secondary)",
	};
}
