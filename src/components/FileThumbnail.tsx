import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { FileText, Image, Film, Music, Archive } from "lucide-react";
import type { FileRecord } from "../types/drive";

function MimeIcon({ mimeType }: { mimeType: string }) {
	if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-cyan-dim" />;
	if (mimeType.startsWith("video/")) return <Film className="w-5 h-5 text-text-secondary" />;
	if (mimeType.startsWith("audio/")) return <Music className="w-5 h-5 text-text-secondary" />;
	if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("archive"))
		return <Archive className="w-5 h-5 text-status-warn" />;
	return <FileText className="w-5 h-5 text-text-muted" />;
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
				className={`w-10 h-10 flex-shrink-0 bg-surface-high border border-border-dim flex items-center justify-center ${clickable ? "cursor-pointer hover:border-cyan-dim transition-colors" : "cursor-default"}`}
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
			className={`w-10 h-10 flex-shrink-0 border border-border-dim overflow-hidden ${clickable ? "cursor-pointer hover:border-cyan-dim" : "cursor-zoom-in"} transition-colors`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setHovered(false)}
			onClick={onPreviewClick}
		>
			<img
				src={file.thumbnailLink}
				alt={file.name}
				loading="lazy"
				className="w-full h-full object-cover"
				onError={() => setImgError(true)}
			/>
			{hovered &&
				ReactDOM.createPortal(
					<div
						style={{
							position: "fixed",
							top: popupPos.top,
							left: popupPos.left,
							transform: "translateY(-100%)",
							zIndex: 9999,
						}}
						className="bg-surface-dim border border-border-mid overflow-hidden p-1.5 pointer-events-none"
					>
						<img
							src={file.thumbnailLink}
							alt={file.name}
							className="max-w-[280px] max-h-[280px] object-contain block"
						/>
						<p className="text-label text-text-muted text-center mt-1 px-1 w-[280px] truncate uppercase tracking-widest">
							{file.name}
						</p>
					</div>,
					document.body,
				)}
		</button>
	);
}
