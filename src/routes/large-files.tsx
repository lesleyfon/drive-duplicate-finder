import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart2, HardDrive, InfoIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteModal } from "../components/DeleteModal";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/cn";
import { classifyMime, LARGE_FILES_LIMIT } from "../lib/deduplicator";
import { formatBytes, formatDate } from "../lib/formatters";
import { useScanStore } from "../store/scanStore";
import type { FileRecord } from "../types/drive";
import { MimeIcon } from "../components/FileThumbnail";
import { useDeleteFiles } from "../hooks/useDeleteFiles";

type LargeSortType = "size" | "name" | "date";

const TYPE_COLORS: Record<string, { light: string; dark: string; text: string }> = {
	video: { light: "#fde8e8", dark: "#2d1515", text: "#f5a623" },
	audio: { light: "#fff8e6", dark: "#221a08", text: "#667eeae6" },
	document: { light: "#e8f7f1", dark: "#102918", text: "#00c48c" },
	image: { light: "#e8f9fd", dark: "#0b1f22", text: "#00f0ff" },
	other: { light: "#f0f0f0", dark: "#1a1a1a", text: "#849495" },
};

function getTypeStyle(mimeType: string, theme: "light" | "dark"): { bg: string; text: string } {
	const family = classifyMime(mimeType);
	const classStyle = TYPE_COLORS[family];

	if (classStyle) {
		return { bg: classStyle[theme], text: classStyle.text };
	}
	return {
		bg: theme === "light" ? "var(--theme-count-badge-bg)" : "var(--theme-border)",
		text: "var(--theme-text-secondary)",
	};
}

const LARGE_SORT_TABS: { key: LargeSortType; label: string }[] = [
	{ key: "size", label: "FILE SIZE" },
	{ key: "name", label: "NAME" },
	{ key: "date", label: "DATE MODIFIED" },
];

const TABLE_COL_TEMPLATE = "28px 36px 56px 1fr 72px 100px 100px";

export const Route = createFileRoute("/large-files")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { theme } = useTheme();
	const scanResult = useScanStore((s) => s.scanResults);
	const deleteMutation = useDeleteFiles();

	const [files, setFiles] = useState<FileRecord[]>(() => scanResult?.largeFiles ?? []);

	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [sort, setSort] = useState<LargeSortType>("size");
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const sizeRankMap = useMemo(() => new Map(files.map((f, i) => [f.id, i + 1])), [files]);
	const maxBytes = useMemo(() => Math.max(...files.map((f) => f.size ?? 0), 0), [files]);
	const combinedBytes = useMemo(() => files.reduce((s, f) => s + (f.size ?? 0), 0), [files]);

	const visibleFiles = useMemo(() => {
		let result = [...files];
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter(
				(f) =>
					f.name.toLowerCase().includes(q) ||
					f.mimeType.toLowerCase().includes(q) ||
					(f.fullFileExtension ?? "").toLowerCase().includes(q),
			);
		}
		if (sort === "name") {
			result.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sort === "date")
			result.sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime));
		else result.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
		return result;
	}, [files, sort, search]);

	const allVisibleSelected =
		visibleFiles.length > 0 && visibleFiles.every((f) => selected.has(f.id));

	const toggleSelect = (id: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const toggleSelectAll = () => {
		const ids = visibleFiles.map((f) => f.id);
		setSelected((prev) => {
			const next = new Set(prev);
			if (allVisibleSelected) {
				for (const id of ids) next.delete(id);
			} else {
				for (const id of ids) next.add(id);
			}
			return next;
		});
	};

	const selectedFiles = files.filter((f) => selected.has(f.id));
	const totalSelectedBytes = selectedFiles.reduce((s, f) => s + (f.size ?? 0), 0);
	const hasSelection = selected.size > 0;

	const handleConfirmDelete = async () => {
		const ids = Array.from(selected);
		const freedBytes = selectedFiles.reduce((s, f) => s + (f.size ?? 0), 0);
		const result = await deleteMutation.mutateAsync(ids);
		setShowModal(false);
		setFiles(useScanStore.getState().scanResults?.largeFiles ?? []);
		setSelected(new Set());
		setSuccessMessage(
			`Deleted ${result.succeeded.length} file${result.succeeded.length !== 1 ? "s" : ""}. ${formatBytes(freedBytes)} freed.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ""}`,
		);
	};

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
						"px-6 py-[6px] border-b border-[var(--theme-border)] shrink-0 bg-[var(--theme-expanded-bg)]",
						" border border-[var(--theme-card-border)] cursor-pointer duration-150 flex items-center justify-between px-5 py-[14px] rounded-t-[10px] text-left transition-colors w-full",
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
						/>
					</div>
					{(["RANK", "TYPE", "FILENAME", "SIZE", "BAR", "MODIFIED"] as const).map(
						(label) => (
							<span
								key={label}
								className="text-[9px] font-bold tracking-[0.08em] uppercase text-[var(--theme-date-text)]"
							>
								{label}
							</span>
						),
					)}
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
							const barPct = maxBytes > 0 ? ((file.size ?? 0) / maxBytes) * 100 : 0;
							const rank = sizeRankMap.get(file.id) ?? 0;
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

									{/* Filename */}
									<span className="text-[13px] font-medium text-[var(--theme-text-primary)] overflow-hidden text-ellipsis whitespace-nowrap pr-3 min-w-0">
										{file.name}
									</span>

									{/* Size */}
									<span
										className="text-left text-[13px] font-bold font-barlow-condensed"
										style={{ color: typeStyle.text }}
									>
										{formatBytes(file.size ?? 0)}
									</span>

									{/* Bar */}
									<div className="px-2 flex items-center">
										<div
											className="w-full h-[4px] rounded-[2px]"
											style={{ background: "var(--theme-border)" }}
										>
											<div
												className="h-[4px] rounded-[2px]"
												style={{
													width: `${barPct}%`,
													background: typeStyle.text,
												}}
											/>
										</div>
									</div>

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
					Showing the top ${LARGE_FILES_LIMIT} largest files in your Google Drive, sorted
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
					isPending={deleteMutation.isPending}
				/>
			)}
		</div>
	);
}
