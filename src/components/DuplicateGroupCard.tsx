import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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

	const groupIdShort = group.key.substring(0, 8).toUpperCase();

	return (
		<div className="border border-border-dim mb-px bg-surface">
			{/* Group header */}
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				className="w-full flex items-center justify-between px-5 py-3 border-b border-border-dim hover:bg-surface-low transition-colors text-left"
			>
				<div className="flex items-center gap-3 flex-wrap">
					<span className="text-text-muted hover:text-cyan-bright transition-colors">
						{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
					</span>

					<span className="text-label uppercase tracking-widest text-text-muted">
						GROUP_ID: <span className="text-text-secondary">{groupIdShort}</span>
					</span>

					<span className="px-2 py-0.5 bg-cyan-dark border border-cyan-dim text-cyan-bright text-label uppercase tracking-widest">
						{group.files.length} DUPLICATES FOUND
					</span>

					<ConfidenceBadge level={group.confidence} />

					{group.selectedForDeletion.size > 0 && (
						<span className="px-2 py-0.5 border border-status-error text-status-error text-label uppercase tracking-widest">
							{group.selectedForDeletion.size} MARKED
						</span>
					)}
				</div>

				<span className="text-label uppercase tracking-widest text-text-muted flex-shrink-0 ml-4">
					POTENTIAL RECLAIM:{" "}
					<span className="text-text-primary">{formatBytes(group.totalWastedBytes)}</span>
				</span>
			</button>

			{/* Collapsed preview */}
			{!expanded && (
				<div className="px-5 py-2 flex items-center gap-3">
					<span className="text-sm text-text-muted truncate">{group.files[0]?.name}</span>
					<span className="text-label text-text-muted flex-shrink-0">
						+{group.files.length - 1} more
					</span>
				</div>
			)}

			{/* Expanded file list */}
			{expanded && (
				<div>
					<div className="flex items-center gap-6 px-5 py-2 border-b border-border-dim bg-surface-dim">
						<span className="text-label uppercase tracking-widest text-text-muted">
							FILE
						</span>
					</div>
					{group.files.map((file) => (
						<FileRow
							key={file.id}
							file={file}
							isKept={group.keepFileId === file.id}
							isSelectedForDeletion={group.selectedForDeletion.has(file.id)}
							onToggleDelete={handleToggleDelete}
							showMd5={group.confidence === "exact"}
						/>
					))}
				</div>
			)}
		</div>
	);
}
