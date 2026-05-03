import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DuplicateGroup, FileRecord } from "../types/drive";
import { formatBytes, formatDate } from "../lib/formatters";
import { getFolderName } from "../lib/driveApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/cn";
import { MimeIcon } from "./FileThumbnail";

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

function CardFileRow({
	file,
	isSelected,
	isKept,
	onToggle,
	accessToken,
	accentColor,
	isLast,
}: {
	file: FileRecord;
	isSelected: boolean;
	isKept: boolean;
	onToggle: (id: string) => void;
	accessToken: string | null;
	accentColor: string;
	isLast: boolean;
}) {
	return (
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
			<span className="text-[11px] text-[var(--theme-path-text)] whitespace-nowrap">
				<FolderCell parentId={file.parents?.[0]} accessToken={accessToken} />
			</span>
			<span className="text-[11px] text-[var(--theme-size-text)] font-semibold whitespace-nowrap">
				{formatBytes(file.size)}
			</span>
			<span className="text-[11px] text-[var(--theme-date-text)] whitespace-nowrap">
				{formatDate(file.modifiedTime)}
			</span>
		</div>
	);
}

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
						<a
							href={`https://drive.google.com/file/d/${group.files[0]?.id}/view`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-inherit no-underline !cursor-pointer"
							onClick={(e) => e.stopPropagation()}
						>
							{group.files[0]?.name}
						</a>
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
						<CardFileRow
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
