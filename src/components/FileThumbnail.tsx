import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { FileText, Image, Film, Music, Archive } from "lucide-react";
import type { FileRecord } from "../types/drive";
import { cn } from "../lib/cn";

export function MimeIcon({ mimeType, className }: { mimeType: string; className?: string }) {
	if (mimeType.startsWith("image/"))
		return <Image className={cn("w-5 h-5 text-[var(--theme-accent)]", className)} />;
	if (mimeType.startsWith("video/"))
		return <Film className={cn("w-5 h-5 text-[var(--theme-body-text)]", className)} />;
	if (mimeType.startsWith("audio/"))
		return <Music className={cn("w-5 h-5 text-[var(--theme-body-text)]", className)} />;
	if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("archive"))
		return <Archive className={cn("w-5 h-5 text-[var(--theme-size-text)]", className)} />;
	return <FileText className={cn("w-5 h-5 text-[var(--theme-caret-color)]", className)} />;
}

interface FileThumbnailProps {
	file: FileRecord;
	onPreviewClick?: () => void;
}

export function FileThumbnail({ file, onPreviewClick }: FileThumbnailProps) {
	const [hovered, setHovered] = useState(false);
	const [imgError, setImgError] = useState(false);
	const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
	const containerRef = useRef<HTMLButtonElement>(null);

	const handleMouseEnter = () => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const popupWidth = 296;
			const left = Math.min(rect.left, window.innerWidth - popupWidth - 8);
			setPopupPos({ top: rect.top - 8, left });
		}
		setHovered(true);
	};

	const clickable = !!onPreviewClick;

	if (!file.thumbnailLink || imgError) {
		return (
			<button
				type="button"
				className={`w-10 h-10 flex-shrink-0 rounded bg-[var(--theme-count-badge-bg)] border border-[var(--theme-card-border)] flex items-center justify-center transition-colors ${clickable ? "cursor-pointer hover:border-[var(--theme-accent)]" : "cursor-default"}`}
				onClick={onPreviewClick}
			>
				<MimeIcon mimeType={file.mimeType} />
			</button>
		);
	}

	return (
		<button
			type="button"
			ref={containerRef}
			className={`w-10 h-10 flex-shrink-0 rounded border border-[var(--theme-card-border)] overflow-hidden transition-colors ${clickable ? "cursor-pointer hover:border-[var(--theme-accent)]" : "cursor-zoom-in"}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setHovered(false)}
			onClick={onPreviewClick}
		>
			<img
				loading="lazy"
				alt={file.name}
				referrerPolicy="no-referrer"
				src={file.thumbnailLink ?? ""}
				onError={() => setImgError(true)}
				className="w-full h-full object-cover"
			/>
			{hovered &&
				ReactDOM.createPortal(
					<div
						style={{
							top: popupPos.top,
							left: popupPos.left,
						}}
						className="fixed -translate-y-full z-[9999] bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-lg overflow-hidden p-2 pointer-events-none shadow-[var(--theme-card-shadow)]"
					>
						<img
							src={file.thumbnailLink ?? ""}
							alt={file.name}
							className="max-w-[280px] max-h-[280px] object-contain block rounded mx-auto"
						/>
						<p className="text-[11px] font-barlow text-[var(--theme-path-text)] text-center mt-1.5 px-1 w-[280px] truncate tracking-[0.04em]">
							{file.name}
						</p>
					</div>,
					document.body,
				)}
		</button>
	);
}
