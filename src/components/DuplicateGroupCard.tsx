import { useState } from "react";
import { ChevronDown, ChevronUp, File } from "lucide-react";
import type { DuplicateGroup } from "../types/drive";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { FileRow } from "./FileRow";
import { formatBytes } from "../lib/formatters";

interface DuplicateGroupCardProps {
	group: DuplicateGroup;
	onGroupChange: (updated: DuplicateGroup) => void;
}

export function DuplicateGroupCard({ group, onGroupChange }: DuplicateGroupCardProps) {
	const [expanded, setExpanded] = useState(false);

	const handleKeep = (fileId: string) => {
		const updated: DuplicateGroup = {
			...group,
			keepFileId: fileId,
			selectedForDeletion: new Set(
				group.files.map((f) => f.id).filter((id) => id !== fileId),
			),
		};
		onGroupChange(updated);
	};

	const handleToggleDelete = (fileId: string) => {
		if (group.keepFileId === fileId) return;
		const updated = new Set(group.selectedForDeletion);
		if (updated.has(fileId)) {
			updated.delete(fileId);
		} else {
			updated.add(fileId);
		}
		onGroupChange({ ...group, selectedForDeletion: updated });
	};

	const wastedLabel =
		group.files.length > 1
			? `${group.files.length - 1} extra cop${group.files.length - 1 === 1 ? "y" : "ies"} × ${formatBytes(group.files[0].size)} = ${formatBytes(group.totalWastedBytes)} wasted`
			: "";

	const mimeLabel = group.files[0]?.mimeType?.split("/").pop()?.toUpperCase() ?? "FILE";

	return (
		<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
			{/* Card header */}
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
			>
				<File className="w-5 h-5 text-gray-400 flex-shrink-0" />

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-medium text-gray-800 truncate">
							{group.files[0]?.name}
						</span>
						<ConfidenceBadge level={group.confidence} />
					</div>
					<div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
						<span>{mimeLabel}</span>
						<span>{group.files.length} copies</span>
						{wastedLabel && <span>{wastedLabel}</span>}
					</div>
				</div>

				<div className="flex items-center gap-2 text-gray-400">
					{group.selectedForDeletion.size > 0 && (
						<span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
							{group.selectedForDeletion.size} to delete
						</span>
					)}
					{expanded ? (
						<ChevronUp className="w-4 h-4" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
				</div>
			</button>

			{/* Expanded file list */}
			{expanded && (
				<div className="border-t border-gray-100 p-3 space-y-2 bg-gray-50">
					<div className="text-xs text-gray-500 flex gap-4 px-1 mb-1">
						<span>Keep</span>
						<span>Delete</span>
					</div>
					{group.files.map((file) => (
						<FileRow
							key={file.id}
							file={file}
							isKept={group.keepFileId === file.id}
							isSelectedForDeletion={group.selectedForDeletion.has(file.id)}
							onKeep={handleKeep}
							onToggleDelete={handleToggleDelete}
							showMd5={group.confidence === "exact"}
						/>
					))}
				</div>
			)}
		</div>
	);
}
