import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "../lib/cn";
import { getFolderName } from "../lib/driveApi";
import { formatBytes, formatDate } from "../lib/formatters";
import type { FileRecord } from "../types/drive";
import { FileThumbnail } from "./FileThumbnail";
import { MediaPlayerModal } from "./MediaPlayerModal";

function FolderCell({
	parentId,
	accessToken,
}: {
	parentId: string | undefined;
	accessToken: string | null;
}) {
	const { data } = useQuery({
		queryKey: ["folder", parentId],
		queryFn: () => getFolderName(accessToken ?? "", parentId ?? ""),
		enabled: !!parentId && !!accessToken,
		staleTime: Infinity,
	});
	return <>{data ?? (parentId ? "…" : "Root")}</>;
}

type FileRowProps = {
	file: FileRecord;
	isSelected: boolean;
	isKept: boolean;
	onToggle: (id: string) => void;
	accessToken: string | null;
	accentColor: string;
	isLast: boolean;
};

export function FileRow({
	file,
	isSelected,
	isKept,
	onToggle,
	accessToken,
	accentColor,
	isLast,
}: FileRowProps) {
	const [showPlayer, setShowPlayer] = useState(false);
	const isMedia =
		file.mimeType.startsWith("audio/") || file.mimeType.startsWith("video/");

	return (
		<>
			<div
				className={cn(
					"flex items-center gap-3 px-5 py-[11px] transition-[background] duration-150",
					!isLast && "border-b border-[var(--theme-file-row-border)]",
				)}
				style={{ background: isSelected ? `${accentColor}12` : "transparent" }}
			>
				<input
					type="checkbox"
					checked={isSelected}
					onChange={() => onToggle(file.id)}
					disabled={isKept}
					title={isKept ? "Keep file" : "Mark for deletion"}
					className="shrink-0"
				/>
				{/* Thumbnail */}
				<FileThumbnail
					file={file}
					onPreviewClick={isMedia ? () => setShowPlayer(true) : undefined}
				/>
				<a
					href={`https://drive.google.com/file/d/${file.id}/view`}
					target="_blank"
					rel="noopener noreferrer"
					className="flex-1 min-w-0"
				>
					<span
						className={cn(
							"flex-1 text-[12px] font-jetbrains overflow-hidden text-ellipsis whitespace-nowrap",
							isSelected
								? "font-semibold text-[var(--theme-body-text)]"
								: "font-normal text-[var(--theme-filename-text)]",
						)}
					>
						{file.name}
					</span>
				</a>
				<span className="text-[11px] text-[var(--theme-path-text)] whitespace-nowrap">
					<FolderCell parentId={file.parents?.[0]} accessToken={accessToken} />
				</span>
				<span className="text-[11px] text-[var(--theme-size-text)] font-semibold whitespace-nowrap">
					{formatBytes(file.size)}
				</span>
				<span className="text-[11px] text-[var(--theme-date-text)] whitespace-nowrap">
					{formatDate(file.modifiedTime)}
				</span>
			</div>{" "}
			{showPlayer && accessToken && (
				<MediaPlayerModal
					file={file}
					accessToken={accessToken}
					onClose={() => setShowPlayer(false)}
				/>
			)}
		</>
	);
}
