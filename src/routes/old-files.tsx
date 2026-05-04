import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, HardDrive, InfoIcon, SearchIcon } from "lucide-react";
import { useMemo } from "react";
import { DeleteModal } from "../components/DeleteModal";
import { useTheme } from "../context/ThemeContext";
import { useFileListState } from "../hooks/useFileListState";
import { cn } from "../lib/cn";
import { OLD_FILES_LIMIT } from "../lib/deduplicator";
import { formatBytes, formatDate } from "../lib/formatters";
import { getTypeStyle } from "../lib/mimeStyles";
import { useScanStore } from "../store/scanStore";
import type { FileRecord } from "../types/drive";
import { MimeIcon } from "../components/FileThumbnail";

export type OldSortType = "date" | "name" | "size";

const OLD_SORT_TABS: { key: OldSortType; label: string }[] = [
	{ key: "date", label: "DATE CREATED" },
	{ key: "name", label: "NAME" },
	{ key: "size", label: "FILE SIZE" },
];

const TABLE_COL_TEMPLATE = "28px 36px 56px 1fr 110px 72px";

export const Route = createFileRoute("/old-files")({
	component: RouteComponent,
});

function sortOldFiles(files: FileRecord[], sort: OldSortType): FileRecord[] {
	const result = [...files];
	if (sort === "name") {
		result.sort((a, b) => a.name.localeCompare(b.name));
	} else if (sort === "size") {
		result.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
	} else {
		result.sort((a, b) => a.createdTime.localeCompare(b.createdTime));
	}
	return result;
}

function RouteComponent() {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const scanResult = useScanStore((s) => s.scanResults);

	const files = useScanStore((s) => s.scanResults?.oldFiles ?? []);

	const {
		selected,
		sort,
		setSort,
		search,
		setSearch,
		showModal,
		setShowModal,
		successMessage,
		errorMessage,
		visibleFiles,
		allVisibleSelected,
		selectedFiles,
		totalSelectedBytes,
		hasSelection,
		toggleSelect,
		toggleSelectAll,
		handleConfirmDelete,
		isPending,
	} = useFileListState<OldSortType>({
		files,
		defaultSort: "date",
		sortFn: sortOldFiles,
	});

	const ageRankMap = useMemo(() => new Map(files.map((file, i) => [file.id, i + 1])), [files]);
	const combinedBytes = useMemo(
		() => files.reduce((total, file) => total + (file.size ?? 0), 0),
		[files],
	);

	if (!scanResult) {
		return (
			<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
				<div className="px-6 py-[14px] flex items-center gap-[10px] bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
					<Clock size={18} className="text-[var(--theme-accent)]" />
					<span className="font-barlow-condensed font-extrabold text-[20px] uppercase tracking-[0.04em] text-[var(--theme-sidebar-active)]">
						Old Files
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
					<Clock size={18} className="text-[var(--theme-accent)]" />
					<span className="font-barlow-condensed font-extrabold text-[20px] uppercase tracking-[0.04em] text-[var(--theme-sidebar-active)]">
						Old Files
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

			{/* ── Error banner ── */}
			{errorMessage && (
				<div className="px-6 py-[10px] border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-topbar-bg)] shrink-0">
					<p className="text-[12px] font-semibold text-[var(--theme-delete-btn-active-bg)] font-barlow tracking-[0.04em]">
						{errorMessage}
					</p>
				</div>
			)}

			{/* ── Sort / filter bar ── */}
			<div className="h-[40px] px-6 flex items-center justify-between bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
				<div className="flex items-center h-full">
					<span className="text-[9px] font-bold tracking-[0.08em] uppercase text-[var(--theme-date-text)] mr-1 shrink-0">
						Sort by
					</span>
					{OLD_SORT_TABS.map(({ key, label }) => (
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
					{(["RANK", "TYPE", "FILENAME", "CREATED", "SIZE"] as const).map((label) => (
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
								No old files found
							</p>
							<p className="text-[13px] text-[var(--theme-path-text)]">
								Your {OLD_FILES_LIMIT} oldest Google Drive files will appear here.
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
							const rank = ageRankMap.get(file.id) ?? 0;
							const isSelected = selected.has(file.id);

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
										<MimeIcon
											mimeType={file.mimeType ?? ""}
											className="shrink-0"
										/>
									</span>
									<a
										href={file.webViewLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[13px] font-medium text-[var(--theme-text-primary)] overflow-hidden text-ellipsis whitespace-nowrap pr-3 min-w-0"
									>
										{file.name}
									</a>

									{/* Created date */}
									<span
										className="text-left text-[13px] font-bold font-barlow-condensed"
										style={{ color: typeStyle.text }}
									>
										{formatDate(file.createdTime)}
									</span>

									{/* Size */}
									<span className="text-[11px] text-[var(--theme-path-text)] text-left">
										{formatBytes(file.size ?? 0)}
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
					Showing the top {OLD_FILES_LIMIT} oldest files in your Google Drive, sorted by
					creation date.
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
