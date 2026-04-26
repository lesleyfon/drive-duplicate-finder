import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import type { FileRecord } from "../types/drive";
import { useAuth } from "../context/AuthContext";
import { getFolderName } from "../lib/driveApi";
import { formatBytes, formatDate } from "../lib/formatters";
import { FileThumbnail } from "./FileThumbnail";
import { MediaPlayerModal } from "./MediaPlayerModal";

interface FileRowProps {
	file: FileRecord;
	isKept: boolean;
	isSelectedForDeletion: boolean;
	onToggleDelete: (fileId: string) => void;
	showMd5: boolean;
}

export function FileRow({
	file,
	isKept,
	isSelectedForDeletion,

	onToggleDelete,
	showMd5,
}: FileRowProps) {
	const { accessToken } = useAuth();
	const parentId = file.parents?.[0];
	const [showPlayer, setShowPlayer] = useState(false);

	const isMedia = file.mimeType.startsWith("audio/") || file.mimeType.startsWith("video/");

	const folderQuery = useQuery({
		queryKey: ["folder", parentId],
		queryFn: () => getFolderName(accessToken ?? "", parentId ?? ""),
		enabled: !!parentId && !!accessToken,
		staleTime: Infinity,
	});

	const rowClass = isSelectedForDeletion
		? "border-l-2 border-status-error bg-surface-low"
		: isKept
			? "border-l-2 border-status-ok bg-surface-low"
			: "border-l-2 border-transparent hover:bg-surface-low";

	return (
		<>
			<div
				className={`flex items-start gap-3 px-5 py-3 border-b border-border-dim transition-colors ${rowClass}`}
			>
				{/* Delete checkbox */}
				<div className="pt-0.5 flex-shrink-0 self-center">
					<input
						type="checkbox"
						checked={isSelectedForDeletion}
						onChange={() => onToggleDelete(file.id)}
						disabled={isKept}
						className="cursor-pointer"
						title="Mark for deletion"
					/>
				</div>

				{/* Thumbnail */}
				<FileThumbnail
					file={file}
					onPreviewClick={isMedia ? () => setShowPlayer(true) : undefined}
				/>

				{/* File details */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5 flex-wrap mb-0.5">
						<a
							href={file.webViewLink}
							target="_blank"
							rel="noopener noreferrer"
							className="text-body font-medium text-cyan-bright hover:text-cyan-dim transition-colors truncate flex items-center gap-1"
						>
							<span>{file.name}</span>
							<ExternalLink className="w-3 h-3  flex-shrink-0 text-cyan-bright hover:text-cyan-dim transition-colors" />
						</a>
					</div>

					<div className="text-sm text-text-muted flex flex-wrap gap-x-4 gap-y-0.5">
						<span>
							<span className="text-border-bright">FOLDER:</span>{" "}
							<span className="text-text-secondary">
								{folderQuery.isPending
									? "..."
									: (folderQuery.data ?? (parentId ? "Unknown" : "Root"))}
							</span>
						</span>
						<span>
							<span className="text-border-bright">SIZE:</span>{" "}
							<span className="text-text-secondary">{formatBytes(file.size)}</span>
						</span>
						<span>
							<span className="text-border-bright">MODIFIED:</span>{" "}
							<span className="text-text-secondary">
								{formatDate(file.modifiedTime)}
							</span>
						</span>
						<span>
							<span className="text-border-bright">CREATED:</span>{" "}
							<span className="text-text-secondary">
								{formatDate(file.createdTime)}
							</span>
						</span>
						{file.owners?.[0] && (
							<span>
								<span className="text-border-bright">OWNER:</span>{" "}
								<span className="text-text-secondary">
									{file.owners[0].displayName}
									{file.owners[0].emailAddress !== file.owners[0].displayName
										? ` (${file.owners[0].emailAddress})`
										: ""}
								</span>
							</span>
						)}
						{showMd5 && file.md5Checksum && (
							<span className="font-mono break-all">
								<span className="text-border-bright">MD5:</span>{" "}
								<span className="text-text-secondary">{file.md5Checksum}</span>
							</span>
						)}
					</div>
				</div>
			</div>

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
