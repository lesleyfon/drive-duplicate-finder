import { HardDrive } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { cn } from "../../lib/cn";
import type { FileRecord } from "../../types/drive";
import { getTypeStyle } from "../../lib/mimeStyles";
import { useTheme } from "../../context/ThemeContext";
import { FileThumbnail } from "../FileThumbnail";

export const TableBody = ({
	files,
	visibleFiles,
	selected,
	toggleSelect,
	colTemplate,
	renderMetricCols,
	emptyTitle,
	emptyDescription,
}: {
	files: FileRecord[];
	visibleFiles: FileRecord[];
	selected: Set<string>;
	toggleSelect: (fileId: string) => void;
	colTemplate: string;
	renderMetricCols: (file: FileRecord, typeStyle: { bg: string; text: string }) => ReactNode;
	emptyTitle: string;
	emptyDescription: string;
}) => {
	const { theme } = useTheme();

	const rankMap = useMemo(() => new Map(files.map((file, i) => [file.id, i + 1])), [files]);

	return (
		<div
			className={cn(
				"flex-1 overflow-y-auto w-full",
				"border border-t-0 border-[var(--theme-card-border)] rounded-b-[10px] px-4 pb-4 pt-3 bg-[var(--theme-card-bg)]",
			)}
		>
			{files.length === 0 ? (
				<div className="h-full flex flex-col items-center justify-center gap-3">
					<HardDrive size={40} className="text-[var(--theme-file-icon-color)]" />
					<p className="text-[16px] font-semibold text-[var(--theme-text-secondary)]">
						{emptyTitle}
					</p>
					<p className="text-[13px] text-[var(--theme-path-text)]">{emptyDescription}</p>
				</div>
			) : visibleFiles.length === 0 ? (
				<div className="flex items-center justify-center p-16">
					<p className="text-[12px] font-semibold text-[var(--theme-text-secondary)] font-barlow tracking-[0.06em] uppercase">
						No results — adjust search
					</p>
				</div>
			) : (
				visibleFiles.map((file) => {
					const typeStyle = getTypeStyle(file.mimeType, theme);
					const rank = rankMap.get(file.id) ?? 0;
					const isSelected = selected.has(file.id);

					return (
						<div
							key={file.id}
							className="py-[8px] border-b border-[var(--theme-file-row-border)] row-hover transition-colors duration-100"
							style={{
								width: "100%",
								display: "grid",
								gridTemplateColumns: colTemplate,
								alignItems: "center",
								background: isSelected ? "var(--theme-file-sel-bg)" : undefined,
							}}
						>
							{/* Checkbox */}
							<input
								type="checkbox"
								checked={isSelected}
								onChange={() => toggleSelect(file.id)}
								aria-label={`Select ${file.name}`}
							/>

							{/* Rank */}
							<span
								className="font-barlow-condensed font-extrabold text-[13px]"
								style={{ color: typeStyle.text }}
							>
								#{rank}
							</span>

							{/* Type badge */}
							<FileThumbnail file={file} />

							{/* Filename */}
							<a
								href={file.webViewLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[13px] font-medium text-[var(--theme-text-primary)] overflow-hidden text-ellipsis whitespace-nowrap pr-3 min-w-0"
							>
								{file.name}
							</a>

							{renderMetricCols(file, typeStyle)}
						</div>
					);
				})
			)}
		</div>
	);
};
