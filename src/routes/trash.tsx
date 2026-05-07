import { createFileRoute } from "@tanstack/react-router";
import { CircleAlertIcon, DotIcon, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { FileThumbnail } from "../components/FileThumbnail";
import { useListTrashedFiles, useRestoreFiles } from "../hooks/useTrashFiles";
import type { RestoreResult } from "../hooks/useTrashFiles";
import { formatBytes, formatRelativeTime } from "../lib/formatters";
import { cn } from "../lib/cn";
import type { FileRecord } from "../types/drive";
import { getMimeLabel } from "../lib/formatters";

export const Route = createFileRoute("/trash")({
	component: TrashPage,
});

function TrashPage() {
	const { allFiles, status, error, refetch, hasNextPage, isFetchingNextPage } =
		useListTrashedFiles();
	const restore = useRestoreFiles();

	const [selected, setSelected] = useState(new Set<string>());
	const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);

	const isInitialLoading = status === "pending";
	const isLoadingMore = status === "success" && (hasNextPage || isFetchingNextPage);
	const hasSelection = selected.size > 0;
	const allSelected = allFiles.length > 0 && selected.size === allFiles.length;

	const toggleSelect = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (allSelected) {
			setSelected(new Set());
		} else {
			setSelected(new Set(allFiles.map((f) => f.id)));
		}
	};

	const handleRestore = async (fileIds: string[]) => {
		setRestoreResult(null);
		try {
			const result = await restore.mutateAsync(fileIds);
			setRestoreResult(result);
			setSelected(new Set());
		} catch {
			// mutation error surfaces via restore.isError
		}
	};

	const successMessage = (() => {
		if (!restoreResult) return null;
		const { succeeded, failed } = restoreResult;
		if (failed.length === 0)
			return `${succeeded.length} file${succeeded.length !== 1 ? "s" : ""} restored to Drive.`;
		return `${succeeded.length} file${succeeded.length !== 1 ? "s" : ""} restored. ${failed.length} file${failed.length !== 1 ? "s" : ""} could not be restored — check your connection and try again.`;
	})();

	return (
		<div className="flex flex-col min-h-full bg-[var(--theme-page-bg)]">
			{/* Header bar */}
			<div className="px-6 py-[14px] flex items-center justify-between bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
				<div className="flex items-center gap-[10px]">
					<RotateCcw size={18} className="text-[var(--theme-accent)]" />
					<span className="font-barlow-condensed font-extrabold text-[20px] uppercase tracking-[0.04em] text-[var(--theme-sidebar-active)]">
						Recently Deleted
					</span>
				</div>

				{allFiles.length > 0 && (
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={toggleSelectAll}
							className="text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
						>
							{allSelected ? "Deselect All" : "Select All"}
						</button>
						{hasSelection && (
							<button
								type="button"
								disabled={restore.isPending}
								onClick={() => handleRestore(Array.from(selected))}
								className={cn(
									"px-[16px] py-[7px] rounded-sm border-none text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed transition-colors duration-150",
									restore.isPending
										? "bg-[var(--theme-delete-btn-bg)] text-[var(--theme-delete-btn-text)] cursor-default"
										: "bg-[var(--theme-accent)] text-[#000] cursor-pointer hover:opacity-90",
								)}
							>
								{restore.isPending
									? "RESTORING…"
									: `Restore Selected (${selected.size})`}
							</button>
						)}
					</div>
				)}
			</div>

			{/* ── Keep hint callout ── */}
			<div className="px-8 pt-3 shrink-0 w-full mb-4">
				<div className="flex items-start gap-2 bg-[var(--theme-warn-bg)] border border-[var(--theme-warn-border)] rounded-[7px] px-[14px] py-[9px]">
					<CircleAlertIcon size={13} stroke="#f5a623" />
					<p className="text-[11px] font-semibold text-[var(--theme-warn-text)] font-barlow leading-[1.5]">
						Items in trash will be <strong>deleted forever</strong> after 30 days.
					</p>
				</div>
			</div>

			{/* Success / partial-failure banner */}
			{successMessage && (
				<div className="px-6 py-[10px] border-b border-[var(--theme-border)] bg-[var(--theme-topbar-bg)] shrink-0 space-y-1">
					<p className="text-[12px] font-semibold text-[var(--theme-accent)] font-barlow tracking-[0.04em]">
						{successMessage}
					</p>
					{restoreResult && restoreResult.succeeded.length > 0 && (
						<p className="text-[11px] text-[var(--theme-text-secondary)] font-barlow">
							Your scan results may be out of date. Run a new scan to see restored
							files.
						</p>
					)}
				</div>
			)}

			{/* API error banner */}
			{status === "error" && (
				<div className="px-6 py-[10px] border-b border-[var(--theme-border)] bg-[var(--theme-topbar-bg)] shrink-0 flex items-center gap-4">
					<p className="text-[12px] font-semibold text-[var(--theme-delete-btn-active-bg)] font-barlow tracking-[0.04em] flex-1">
						Failed to load trash: {(error as Error)?.message ?? "Unknown error"}
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed text-[var(--theme-accent)] hover:opacity-80 transition-opacity"
					>
						Retry
					</button>
				</div>
			)}

			{/* Initial loading spinner */}
			{isInitialLoading && (
				<div className="flex-1 flex items-center justify-center">
					<Loader2 size={24} className="animate-spin text-[var(--theme-accent)]" />
				</div>
			)}

			{/* Empty state */}
			{!isInitialLoading && status === "success" && allFiles.length === 0 && (
				<div className="flex-1 flex flex-col items-center justify-center gap-2">
					<p className="font-barlow-condensed font-black text-[22px] uppercase tracking-[0.06em] text-[var(--theme-text-primary)]">
						NO FILES IN TRASH
					</p>
					<p className="text-[12px] text-[var(--theme-text-secondary)] font-barlow">
						Files you delete will appear here for 30 days.
					</p>
				</div>
			)}

			{/* File list */}
			{!isInitialLoading && allFiles.length > 0 && (
				<div className="flex-1 overflow-y-auto">
					{allFiles.map((file) => (
						<TrashFileRow
							key={file.id}
							file={file}
							isSelected={selected.has(file.id)}
							onToggle={() => toggleSelect(file.id)}
							onRestore={() => handleRestore([file.id])}
							isRestoring={restore.isPending}
						/>
					))}
					{isLoadingMore && (
						<div className="flex items-center justify-center py-4">
							<Loader2
								size={16}
								className="animate-spin text-[var(--theme-accent)]"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function TrashFileRow({
	file,
	isSelected,
	onToggle,
	onRestore,
	isRestoring,
}: {
	file: FileRecord;
	isSelected: boolean;
	onToggle: () => void;
	onRestore: () => void;
	isRestoring: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 px-6 py-[10px] border-b border-[var(--theme-border)] hover:bg-[var(--theme-topbar-bg)] transition-colors",
				isSelected && "bg-[var(--theme-sidebar-active-bg)]",
			)}
		>
			<input
				type="checkbox"
				checked={isSelected}
				disabled={isRestoring}
				onChange={onToggle}
				className="w-4 h-4 shrink-0 accent-[var(--theme-accent)] cursor-pointer disabled:cursor-default"
			/>
			<FileThumbnail file={file} />
			<div className="flex-1 min-w-0">
				<p className="text-[13px] font-semibold text-[var(--theme-text-primary)] font-barlow truncate">
					{file.name}
				</p>
				<div className="text-[11px] text-[var(--theme-text-secondary)] font-barlow flex flex-row items-center justify-start gap-1">
					<span>{getMimeLabel(file.mimeType)}: </span>
					<span className=" font-extrabold">{formatBytes(file.size)}</span>
					<span>
						<DotIcon />
					</span>
					<span>Trashed: </span>
					<span className=" font-extrabold">
						{file.trashedTime ? (
							formatRelativeTime(file.trashedTime)
						) : (
							<div className="relative h-2 w-14 overflow-hidden rounded-sm bg-[var(--theme-text-secondary)] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent" />
						)}
					</span>
				</div>
			</div>
			<button
				type="button"
				disabled={isRestoring}
				onClick={onRestore}
				className={cn(
					"shrink-0 px-[14px] py-[6px] rounded-sm text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed transition-colors duration-150 border",
					isRestoring
						? "border-[var(--theme-border)] text-[var(--theme-text-secondary)] opacity-40 cursor-default"
						: "border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-[#000] cursor-pointer",
				)}
			>
				Restore
			</button>
		</div>
	);
}
