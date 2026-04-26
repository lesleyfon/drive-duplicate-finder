import { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { FileText, Image, Film, Music, Archive } from "lucide-react";
import type { FileRecord } from "../types/drive";

function MimeIcon({ mimeType }: { mimeType: string }) {
	if (mimeType.startsWith("image/")) return <Image className="w-8 h-8 text-blue-400" />;
	if (mimeType.startsWith("video/")) return <Film className="w-8 h-8 text-purple-400" />;
	if (mimeType.startsWith("audio/")) return <Music className="w-8 h-8 text-green-400" />;
	if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("archive"))
		return <Archive className="w-8 h-8 text-yellow-500" />;
	return <FileText className="w-8 h-8 text-gray-400" />;
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
		console.log("Rendering default thumbnail for file:", file.name, file.thumbnailLink);
		console.log("Rendering default thumbnail for file:", imgError);
		return (
			<button
				type="button"
				className={`w-[90px] h-[90px] flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 ${clickable ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""}`}
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
			className={`w-[90px] h-[90px] flex-shrink-0 ${clickable ? "cursor-pointer" : "cursor-zoom-in"}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setHovered(false)}
			onClick={onPreviewClick}
		>
			<img
				src={file.thumbnailLink}
				alt={file.name}
				loading="lazy"
				className="w-full h-full object-cover rounded-lg border border-gray-200"
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
						className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden p-1.5 pointer-events-none"
					>
						<img
							src={file.thumbnailLink}
							alt={file.name}
							className="max-w-[280px] max-h-[280px] object-contain rounded-lg block"
						/>
						<p className="text-xs text-gray-500 text-center mt-1 px-1 w-[280px] truncate">
							{file.name}
						</p>
					</div>,
					document.body,
				)}
		</button>
	);
}
