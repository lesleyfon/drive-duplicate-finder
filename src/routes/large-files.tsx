import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart2, HardDrive, InfoIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteModal } from "../components/DeleteModal";
import { useTheme } from "../context/ThemeContext";
import { useFileListState } from "../hooks/useFileListState";
import { cn } from "../lib/cn";
import { LARGE_FILES_LIMIT } from "../lib/deduplicator";
import { formatBytes, formatDate } from "../lib/formatters";
import { getTypeStyle } from "../lib/mimeStyles";
import { useScanStore } from "../store/scanStore";
import type { FileRecord } from "../types/drive";
import { FileThumbnail, MimeIcon } from "../components/FileThumbnail";

export type LargeSortType = "size" | "name" | "date";

export const LARGE_SORT_TABS: { key: LargeSortType; label: string }[] = [
	{ key: "size", label: "FILE SIZE" },
	{ key: "name", label: "NAME" },
	{ key: "date", label: "DATE MODIFIED" },
];

export const TABLE_COL_TEMPLATE = "28px 36px 56px 1fr 72px 100px";

export const Route = createFileRoute("/large-files")({
	component: RouteComponent,
});

function sortLargeFiles(files: FileRecord[], sort: LargeSortType): FileRecord[] {
	const result = [...files];
	if (sort === "name") {
		result.sort((a, b) => a.name.localeCompare(b.name));
	} else if (sort === "date") {
		result.sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime));
	} else {
		result.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
	}
	return result;
}

function RouteComponent() {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const scanResult = useScanStore((s) => s.scanResults);
	const files = useScanStore((s) => s.scanResults?.largeFiles ?? []);
	const [_showPlayer, setShowPlayer] = useState(false);

	const {
		selected,
		sort,
		setSort,
		search,
		setSearch,
		showModal,
		setShowModal,
		successMessage,
		errorMessage: _errorMessage,
		visibleFiles,
		allVisibleSelected,
		selectedFiles,
		totalSelectedBytes,
		hasSelection,
		toggleSelect,
		toggleSelectAll,
		handleConfirmDelete,
		isPending,
	} = useFileListState<LargeSortType>({
		files,
		defaultSort: "size",
		sortFn: sortLargeFiles,
	});

	const sizeRankMap = useMemo(() => new Map(files.map((file, i) => [file.id, i + 1])), [files]);
	const combinedBytes = useMemo(
		() => files.reduce((totalBytes, file) => totalBytes + (file.size ?? 0), 0),
		[files],
	);

	if (!scanResult) {
		return (
			<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
				<div className="px-6 py-[14px] flex items-center gap-[10px] bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
					<BarChart2 size={18} className="text-[var(--theme-accent)]" />
					<span className="font-barlow-condensed font-extrabold text-[20px] uppercase tracking-[0.04em] text-[var(--theme-sidebar-active)]">
						Large Files
					</span>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center gap-4">
					<p className="text-[11px] font-bold text-[var(--theme-text-secondary)] tracking-[0.08em] uppercase font-barlow">
						No scan data — run a scan first
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/dashboard" })}
						className="px-5 py-2 rounded bg-[var(--theme-accent)] text-white text-[12px] font-bold tracking-[0.06em] uppercase font-barlow border-none cursor-pointer"
					>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-full bg-[var(--theme-page-bg)]">
			{/* ── Page header ── */}
			<div className="px-6 py-[14px] flex items-center justify-between bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
				<div className="flex items-center gap-[10px]">
					<BarChart2 size={18} className="text-[var(--theme-accent)]" />
					<span className="font-barlow-condensed font-extrabold text-[20px] uppercase tracking-[0.04em] text-[var(--theme-sidebar-active)]">
						Large Files
					</span>
				</div>
				<div className="flex items-center gap-[18px]">
					<span className="text-[12px] font-medium text-[var(--theme-text-secondary)]">
						{visibleFiles.length} files shown
					</span>
					<span className="text-[var(--theme-border)] select-none">|</span>
					<span>
						<span
							className="text-[14px] font-bold font-barlow-condensed"
							style={{ color: "var(--theme-large-file-size)" }}
						>
							{formatBytes(combinedBytes)}
						</span>
						<span className="text-[12px] font-medium text-[var(--theme-text-secondary)]">
							{" "}
							combined
						</span>
					</span>
					<button
						type="button"
						disabled={!hasSelection}
						onClick={() => setShowModal(true)}
						aria-label={`Delete ${selected.size} selected files`}
						className={cn(
							"px-[16px] py-[7px] rounded-sm border-none text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed transition-colors duration-150",
							hasSelection
								? "bg-[var(--theme-delete-btn-active-bg)] text-[var(--theme-delete-btn-active-text)] cursor-pointer"
								: "bg-[var(--theme-delete-btn-bg)] text-[var(--theme-delete-btn-text)] cursor-default",
						)}
					>
						Delete Selected
					</button>
				</div>
			</div>

			{/* ── Success banner ── */}
			{successMessage && (
				<div className="px-6 py-[10px] border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-topbar-bg)] shrink-0">
					<p className="text-[12px] font-semibold text-[var(--theme-accent)] font-barlow tracking-[0.04em]">
						{successMessage}
					</p>
				</div>
			)}

			{/* ── Sort / filter bar ── */}
			<div className="h-[40px] px-6 flex items-center justify-between bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
				<div className="flex items-center h-full">
					<span className="text-[9px] font-bold tracking-[0.08em] uppercase text-[var(--theme-date-text)] mr-1 shrink-0">
						Sort by
					</span>
					{LARGE_SORT_TABS.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							onClick={() => setSort(key)}
							className={cn(
								"px-[16px] h-full flex items-center text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed border-none bg-transparent cursor-pointer transition-colors duration-150",
								sort === key
									? "text-[var(--theme-sidebar-active)] border-b-2 border-[var(--theme-accent)]"
									: "text-[var(--theme-filter-inactive)] border-b-2 border-transparent hover:text-[var(--theme-count-badge-text)]",
							)}
						>
							{label}
						</button>
					))}
				</div>
				<div className="relative flex items-center">
					<SearchIcon
						size={12}
						className="absolute left-[9px] text-[var(--theme-date-text)] pointer-events-none"
					/>
					<input
						type="text"
						placeholder="Search filename or type..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-[200px] h-[28px] pl-[28px] pr-[10px] text-[11px] bg-[var(--theme-search-bg)] border border-[var(--theme-border)] rounded-sm text-[var(--theme-body-text)] placeholder:text-[var(--theme-date-text)] outline-none font-barlow"
					/>
				</div>
			</div>

			<div className="px-8 py-4 flex flex-col items-center justify-between overflow-auto">
				{/* ── Table header ── */}
				<div
					className={cn(
						"px-5 py-[10px] border border-[var(--theme-card-border)] bg-[var(--theme-expanded-bg)] rounded-t-[10px] w-full shrink-0",
					)}
					style={{
						display: "grid",
						gridTemplateColumns: TABLE_COL_TEMPLATE,
						alignItems: "center",
						width: "100%",
					}}
				>
					<div>
						<input
							type="checkbox"
							checked={allVisibleSelected}
							onChange={toggleSelectAll}
							aria-label="Select all visible files"
						/>
					</div>
					{(["RANK", "TYPE", "FILENAME", "SIZE", "MODIFIED"] as const).map((label) => (
						<span
							key={label}
							className="text-[9px] font-bold tracking-[0.08em] uppercase text-[var(--theme-date-text)]"
						>
							{label}
						</span>
					))}
				</div>
				{/* ── Table body ── */}
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
								No large files found
							</p>
							<p className="text-[13px] text-[var(--theme-path-text)]">
								Your {LARGE_FILES_LIMIT} largest Google Drive files will appear
								here.
							</p>
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
							const rank = sizeRankMap.get(file.id) ?? 0;
							const isSelected = selected.has(file.id);

							const isMedia =
								file.mimeType.startsWith("audio/") ||
								file.mimeType.startsWith("video/");

							return (
								<div
									key={file.id}
									className="py-[8px] border-b border-[var(--theme-file-row-border)] row-hover transition-colors duration-100"
									style={{
										width: "100%",
										display: "grid",
										gridTemplateColumns: TABLE_COL_TEMPLATE,
										alignItems: "center",
										background: isSelected
											? "var(--theme-file-sel-bg)"
											: undefined,
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
									<span className="inline-block px-[6px] py-[2px] rounded-sm font-barlow-condensed font-bold text-[10px] tracking-[0.04em] uppercase w-fit">
										<FileThumbnail file={file} />
									</span>

									{/* Filename */}
									<a
										href={file.webViewLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[13px] font-medium text-[var(--theme-text-primary)] overflow-hidden text-ellipsis whitespace-nowrap pr-3 min-w-0"
									>
										{file.name}
									</a>

									{/* Size */}
									<span
										className="text-left text-[13px] font-bold font-barlow-condensed"
										style={{ color: typeStyle.text }}
									>
										{formatBytes(file.size ?? 0)}
									</span>

									{/* Date */}
									<span className="text-[11px] text-[var(--theme-path-text)] text-left">
										{formatDate(file.modifiedTime)}
									</span>
								</div>
							);
						})
					)}
				</div>
			</div>

			<div className="flex items-center justify-center gap-[6px] mb-5">
				<InfoIcon size={11} className="text-[var(--theme-date-text)]" />
				<span className="text-[10px] text-[#aaaaaa] font-semibold">
					Showing the top {LARGE_FILES_LIMIT} largest files in your Google Drive, sorted
					by file size.
				</span>
			</div>

			{/* ── Delete modal ── */}
			{showModal && (
				<DeleteModal
					files={selectedFiles}
					totalBytes={totalSelectedBytes}
					onConfirm={handleConfirmDelete}
					onCancel={() => setShowModal(false)}
					isPending={isPending}
				/>
			)}
		</div>
	);
}
