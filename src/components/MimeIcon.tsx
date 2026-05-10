import { Archive, FileText, Film, Image, Music } from "lucide-react";
import { cn } from "../lib/cn";

export function MimeIcon({
	mimeType,
	className,
}: {
	mimeType: string;
	className?: string;
}) {
	if (mimeType.startsWith("image/")) {
		return (
			<Image className={cn("w-5 h-5 text-[var(--theme-accent)]", className)} />
		);
	}
	if (mimeType.startsWith("video/")) {
		return (
			<Film
				className={cn("w-5 h-5 text-[var(--theme-body-text)]", className)}
			/>
		);
	}
	if (mimeType.startsWith("audio/")) {
		return (
			<Music
				className={cn("w-5 h-5 text-[var(--theme-body-text)]", className)}
			/>
		);
	}
	if (
		mimeType.includes("zip") ||
		mimeType.includes("tar") ||
		mimeType.includes("archive")
	) {
		return (
			<Archive
				className={cn("w-5 h-5 text-[var(--theme-size-text)]", className)}
			/>
		);
	}
	return (
		<FileText
			className={cn("w-5 h-5 text-[var(--theme-caret-color)]", className)}
		/>
	);
}
