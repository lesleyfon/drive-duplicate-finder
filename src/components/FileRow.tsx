import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import type { FileRecord } from "../types/drive";
import { useAuth } from "../context/AuthContext";
import { getFolderName } from "../lib/driveApi";
import { formatBytes, formatDate } from "../lib/formatters";

interface FileRowProps {
	file: FileRecord;
	isKept: boolean;
	isSelectedForDeletion: boolean;
	onKeep: (fileId: string) => void;
	onToggleDelete: (fileId: string) => void;
	showMd5: boolean;
}

export function FileRow({
	file,
	isKept,
	isSelectedForDeletion,
	onKeep,
	onToggleDelete,
	showMd5,
}: FileRowProps) {
	const { accessToken } = useAuth();
	const parentId = file.parents?.[0];

	if (!accessToken) {
		throw new Error("FileRow must be used within an AuthProvider. Missing access token.");
	}

	if (parentId === undefined) {
		throw new Error(`File ${file.id} is missing parent information.`);
	}

	const folderQuery = useQuery({
		queryKey: ["folder", parentId],
		queryFn: () => getFolderName(accessToken, parentId),
		enabled: !!parentId && !!accessToken,
		staleTime: Infinity,
	});

	return (
		<div
			className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
				isSelectedForDeletion
					? "bg-red-50 border-red-200"
					: isKept
						? "bg-green-50 border-green-200"
						: "bg-white border-gray-100 hover:border-gray-200"
			}`}
		>
			{/* Keep radio */}
			<div className="pt-0.5">
				<input
					type="radio"
					name={`keep-${file.id}`}
					checked={isKept}
					onChange={() => onKeep(file.id)}
					className="accent-green-600 w-4 h-4 cursor-pointer"
					title="Keep this file"
				/>
			</div>

			{/* Delete checkbox */}
			<div className="pt-0.5">
				<input
					type="checkbox"
					checked={isSelectedForDeletion}
					onChange={() => onToggleDelete(file.id)}
					disabled={isKept}
					className="accent-red-600 w-4 h-4 cursor-pointer disabled:opacity-40"
					title="Mark for deletion"
				/>
			</div>

			{/* File details */}
			<div className="flex-1 min-w-0 text-sm space-y-0.5">
				<div className="flex items-center gap-1.5 flex-wrap">
					<a
						href={file.webViewLink}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-blue-700 hover:underline truncate"
					>
						{file.name}
					</a>
					<ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
				</div>

				<div className="text-gray-500 text-xs flex flex-wrap gap-x-4 gap-y-0.5">
					<span>
						<span className="text-gray-400">Folder:</span>{" "}
						{folderQuery.isPending
							? "…"
							: (folderQuery.data ?? (parentId ? "Unknown" : "Root"))}
					</span>
					<span>
						<span className="text-gray-400">Size:</span> {formatBytes(file.size)}
					</span>
					<span>
						<span className="text-gray-400">Modified:</span>{" "}
						{formatDate(file.modifiedTime)}
					</span>
					<span>
						<span className="text-gray-400">Created:</span>{" "}
						{formatDate(file.createdTime)}
					</span>
					{file.owners?.[0] && (
						<span>
							<span className="text-gray-400">Owner:</span>{" "}
							{file.owners[0].displayName}
							{file.owners[0].emailAddress !== file.owners[0].displayName
								? ` (${file.owners[0].emailAddress})`
								: ""}
						</span>
					)}
					{showMd5 && file.md5Checksum && (
						<span className="font-mono break-all">
							<span className="text-gray-400">MD5:</span> {file.md5Checksum}
						</span>
					)}
				</div>

				{/* Warn if not owned by signed-in user */}
				{file.owners?.length > 0 && <></>}
			</div>
		</div>
	);
}
