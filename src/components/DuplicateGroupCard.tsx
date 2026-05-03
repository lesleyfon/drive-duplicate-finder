import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DuplicateGroup } from "../types/drive";
import { formatBytes } from "../lib/formatters";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/cn";
import { MimeIcon } from "./FileThumbnail";
import { FileRow } from "./FileRow";

const TYPE_COLORS = {
	light: {
		exact: { bg: "#e8f5f2", border: "#00b894", text: "#007a5e", label: "Exact Match" },
		likely: { bg: "#fff8e6", border: "#f5a623", text: "#b8750f", label: "Likely Duplicate" },
		version: { bg: "#eff3ff", border: "#667eea", text: "#4a5bd4", label: "Possible Version" },
	},
	dark: {
		exact: {
			bg: "rgba(0,201,167,0.08)",
			border: "#00c9a7",
			text: "#00c9a7",
			label: "Exact Match",
		},
		likely: {
			bg: "rgba(245,166,35,0.08)",
			border: "#f5a623",
			text: "#f5a623",
			label: "Likely Duplicate",
		},
		version: {
			bg: "rgba(102,126,234,0.08)",
			border: "#667eea",
			text: "#8b9ef0",
			label: "Possible Version",
		},
	},
};

interface DuplicateGroupCardProps {
	group: DuplicateGroup;
	onGroupChange: (updated: DuplicateGroup) => void;
}

export function DuplicateGroupCard({ group, onGroupChange }: DuplicateGroupCardProps) {
	const [expanded, setExpanded] = useState(false);
	const { theme } = useTheme();
	const { accessToken } = useAuth();

	const typeColor = TYPE_COLORS[theme][group.confidence];
	const isGroupSelected = group.selectedForDeletion.size > 0;

	const handleToggleFile = (fileId: string) => {
		if (group.keepFileId === fileId) return;
		const updated = new Set(group.selectedForDeletion);
		if (updated.has(fileId)) updated.delete(fileId);
		else updated.add(fileId);
		onGroupChange({ ...group, selectedForDeletion: updated });
	};

	return (
		<div
			className={cn(
				"rounded-xl overflow-hidden transition-all duration-200 shrink-0 bg-[var(--theme-card-bg)]",
				isGroupSelected
					? "shadow-[var(--theme-card-shadow-sel)]"
					: "shadow-[var(--theme-card-shadow)]",
				"border",
				isGroupSelected
					? "border-[var(--theme-card-border-sel)]"
					: "border-[var(--theme-card-border)]",
			)}
		>
			{/* Card header */}
			<div
				className="flex items-center border-l-4 transition-colors duration-200"
				style={{ borderLeftColor: typeColor.border }}
			>
				{/* Mime icon */}
				<div className="p-4 flex items-center">
					<MimeIcon mimeType={group.files[0]?.mimeType ?? ""} />
				</div>

				{/* File info — click to expand */}
				<button
					type="button"
					className="flex-1 py-4 cursor-pointer min-w-0"
					onClick={() => setExpanded((v) => !v)}
				>
					<div className="flex items-center gap-[10px] mb-[5px]">
						<span
							className={cn(
								"rounded-sm text-[10px] font-bold tracking-[0.08em] py-[3px] px-2 uppercase font-barlow whitespace-nowrap",
								"border-[1px]",
							)}
							style={{
								background: typeColor.bg,
								color: typeColor.text,
								borderColor: typeColor.border,
							}}
						>
							{typeColor.label}
						</span>
						<span className="bg-[var(--theme-count-badge-bg)] text-[var(--theme-count-badge-text)] rounded-sm text-[10px] font-bold py-[3px] px-2 font-barlow whitespace-nowrap">
							{group.files.length} files
						</span>
					</div>
					<div className="text-[13px] font-jetbrains text-[var(--theme-body-text)] overflow-hidden text-ellipsis whitespace-nowrap max-w-[480px] text-left">
						<p className="text-inherit no-underline !cursor-pointer">
							{group.files[0]?.name}
						</p>
					</div>
				</button>

				{/* Reclaim size */}
				<div className="px-5 py-4 text-right shrink-0">
					<div className="text-[11px] text-[var(--theme-text-dim)] uppercase tracking-[0.06em] mb-0.5 font-barlow">
						Reclaim
					</div>
					<div className="text-[18px] font-extrabold font-barlow-condensed text-[var(--theme-accent)]">
						{formatBytes(group.totalWastedBytes)}
					</div>
				</div>

				{/* Chevron */}
				<button
					type="button"
					className="pl-0 pr-4 py-4 cursor-pointer shrink-0"
					onClick={() => setExpanded((v) => !v)}
				>
					<ChevronDown
						size={16}
						className={cn(
							"text-[var(--theme-caret-color)] transition-transform duration-200",
							`transition-transform ${expanded ? "rotate-180" : "rotate-0"}`,
						)}
					/>
				</button>
			</div>

			{/* Expanded file list */}
			{expanded && (
				<div className="border-t border-[var(--theme-expanded-border)] bg-[var(--theme-expanded-bg)]">
					{group.files.map((file, i) => (
						<FileRow
							key={file.id}
							file={file}
							isSelected={group.selectedForDeletion.has(file.id)}
							isKept={group.keepFileId === file.id}
							onToggle={handleToggleFile}
							accessToken={accessToken}
							accentColor={typeColor.border}
							isLast={i === group.files.length - 1}
						/>
					))}
				</div>
			)}
		</div>
	);
}
