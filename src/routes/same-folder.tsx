import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, SearchIcon, FolderIcon, FileIcon, CircleAlertIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteModal } from "../components/DeleteModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useDeleteFiles } from "../hooks/useDeleteFiles";
import { cn } from "../lib/cn";
import { getFolderName } from "../lib/driveApi";
import { formatBytes, formatDate } from "../lib/formatters";
import { useScanStore } from "../store/scanStore";
import type { DuplicateGroup, FileRecord, SameFolderGroup } from "../types/drive";

export const Route = createFileRoute("/same-folder")({
	component: SameFolderPage,
});

const CONFIDENCE_COLORS = {
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

function FolderName({ folderId }: { folderId: string }) {
	const { accessToken } = useAuth();
	const { data } = useQuery({
		queryKey: ["folder", folderId],
		queryFn: () => getFolderName(accessToken ?? "", folderId),
		enabled: !!folderId && !!accessToken,
		staleTime: Infinity,
	});
	return <>{data ?? "…"}</>;
}

function SameFolderPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { theme } = useTheme();

	const scanResult = useScanStore((s) => s.scanResults);
	const [groups, setGroups] = useState<SameFolderGroup[]>(
		() => scanResult?.sameFolderGroups ?? [],
	);

	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
	const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const deleteMutation = useDeleteFiles();

	const filteredGroups = useMemo(() => {
		if (!search.trim()) return groups;
		const q = search.trim().toLowerCase();
		return groups.filter(
			(g) =>
				g.folderId.toLowerCase().includes(q) ||
				g.sets.some((s) => s.files.some((f) => f.name.toLowerCase().includes(q))),
		);
	}, [groups, search]);

	const totalSets = groups.reduce((s, g) => s + g.sets.length, 0);
	const totalBytes = groups.reduce((s, g) => s + g.totalWastedBytes, 0);

	const allSelectedRecords = useMemo(() => {
		const result: FileRecord[] = [];
		for (const g of groups) {
			for (const set of g.sets) {
				set.files.forEach((file, i) => {
					if (selectedFiles.has(`${set.key}::${i}`)) result.push(file);
				});
			}
		}
		return result;
	}, [groups, selectedFiles]);

	const totalSelectedBytes = allSelectedRecords.reduce((s, f) => s + (f.size ?? 0), 0);
	const hasSelection = allSelectedRecords.length > 0;

	const toggleFile = (setKey: string, fileIndex: number) => {
		const key = `${setKey}::${fileIndex}`;
		setSelectedFiles((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const toggleFolder = (folderId: string) => {
		setCollapsedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) next.delete(folderId);
			else next.add(folderId);
			return next;
		});
	};

	const toggleSet = (setKey: string) => {
		setExpandedSets((prev) => {
			const next = new Set(prev);
			if (next.has(setKey)) next.delete(setKey);
			else next.add(setKey);
			return next;
		});
	};

	const allSelectedInSet = (set: DuplicateGroup) =>
		set.files.every((_, i) => selectedFiles.has(`${set.key}::${i}`));

	const selectedCountInSet = (set: DuplicateGroup) =>
		set.files.filter((_, i) => selectedFiles.has(`${set.key}::${i}`)).length;

	const selectedCountInFolder = (group: SameFolderGroup) => {
		let count = 0;
		for (const set of group.sets) {
			set.files.forEach((_, i) => {
				if (selectedFiles.has(`${set.key}::${i}`)) count++;
			});
		}
		return count;
	};

	const handleConfirmDelete = async () => {
		const ids = allSelectedRecords.map((f) => f.id);
		const result = await deleteMutation.mutateAsync(ids);
		setShowModal(false);
		setSelectedFiles(new Set());
		const updated = useScanStore.getState().scanResults;
		if (updated) setGroups(updated.sameFolderGroups);
		const freed = allSelectedRecords.reduce((s, f) => s + (f.size ?? 0), 0);
		setSuccessMessage(
			`Deleted ${result.succeeded.length} file${result.succeeded.length !== 1 ? "s" : ""}. ${formatBytes(freed)} freed.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ""}`,
		);
	};

	const handleNewScan = () => {
		queryClient.removeQueries({ queryKey: ["scanFiles"] });
		useScanStore.getState().resetScan();
		navigate({ to: "/scan" });
	};

	if (!scanResult) {
		return (
			<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
				<div className="h-14 px-8 flex items-center gap-2 bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-topbar-border)]">
					<FolderIcon size={17} className="text-[var(--theme-accent)]" />
					<span className="text-[13px] font-semibold text-[var(--theme-text-primary)] tracking-[0.05em] uppercase font-barlow">
						Same Folder Duplicates
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
		<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
			{/* ── Top bar ── */}
			<div className="h-14 px-8 flex items-center gap-6 bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-topbar-border)] shrink-0">
				<div className="flex items-center gap-2">
					<FolderIcon size={17} className="text-[var(--theme-accent)]" />
					<span className="text-[13px] font-semibold text-[var(--theme-text-primary)] tracking-[0.05em] uppercase font-barlow">
						Same Folder Duplicates
					</span>
				</div>

				<div className="flex-1 flex justify-center gap-5 text-[12px] text-[var(--theme-text-secondary)] font-barlow">
					<span>
						<b className="text-[var(--theme-text-primary)] text-[13px]">
							{groups.length}
						</b>{" "}
						folders
					</span>
					<span>
						<b className="text-[var(--theme-text-primary)] text-[13px]">{totalSets}</b>{" "}
						sets
					</span>
					<span>
						<b className="text-[var(--theme-accent)] text-[13px]">
							{formatBytes(totalBytes)}
						</b>{" "}
						recoverable
					</span>
				</div>

				<button
					type="button"
					disabled={!hasSelection}
					onClick={() => setShowModal(true)}
					className={cn(
						"px-[18px] py-[7px] rounded border-none text-[12px] font-bold tracking-[0.06em] uppercase font-barlow transition-all duration-200 whitespace-nowrap",
						hasSelection
							? "bg-[var(--theme-delete-btn-active-bg)] text-[var(--theme-delete-btn-active-text)] cursor-pointer"
							: "bg-[var(--theme-delete-btn-bg)] text-[var(--theme-delete-btn-text)] cursor-default",
					)}
				>
					{hasSelection
						? `Delete ${allSelectedRecords.length} selected`
						: "Delete selected"}
				</button>
			</div>

			{/* ── Success banner ── */}
			{successMessage && (
				<div className="px-8 py-[10px] border-b border-[var(--theme-topbar-border)] flex items-center justify-between gap-4 bg-[var(--theme-topbar-bg)] shrink-0">
					<p className="text-[12px] font-semibold text-[var(--theme-accent)] font-barlow tracking-[0.04em]">
						{successMessage}
					</p>
					<button
						type="button"
						onClick={handleNewScan}
						className="text-[11px] font-bold text-[var(--theme-text-secondary)] bg-transparent border-none cursor-pointer tracking-[0.06em] uppercase font-barlow shrink-0"
					>
						Run New Scan
					</button>
				</div>
			)}

			{/* ── Filter / info bar ── */}
			<div className="h-11 px-8 flex items-center gap-3 bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-topbar-border)] shrink-0">
				<FolderIcon size={12} className="text-[var(--theme-text-secondary)] shrink-0" />
				<span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--theme-text-secondary)] font-barlow">
					Grouped by folder
				</span>
				<div className="w-px h-4 bg-[var(--theme-topbar-border)] shrink-0" />
				<span className="text-[10px] font-semibold text-[var(--theme-text-dim)] font-barlow">
					Files in each set share the exact same location
				</span>
				<div className="flex-1" />
				<div className="flex items-center gap-2 bg-[var(--theme-search-bg)] border border-[var(--theme-topbar-border)] rounded px-3 py-[6px]">
					<SearchIcon width="13" height="13" viewBox="0 0 24 24" />
					<input
						type="text"
						placeholder="Search folders or filenames…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="border-none bg-transparent text-[12px] text-[var(--theme-body-text)] outline-none w-[180px] font-barlow"
					/>
				</div>
			</div>

			{/* ── Keep hint callout ── */}
			<div className="px-8 pt-3 shrink-0">
				<div className="flex items-start gap-2 bg-[var(--theme-warn-bg)] border border-[var(--theme-warn-border)] rounded-[7px] px-[14px] py-[9px]">
					<CircleAlertIcon size={13} stroke="#f5a623" />
					<p className="text-[11px] font-semibold text-[var(--theme-warn-text)] font-barlow leading-[1.5]">
						<strong>To keep a file:</strong> leave it unchecked. Only check the files
						you want to <strong>delete</strong>. At least one file in each set must
						remain unchecked.
					</p>
				</div>
			</div>

			{/* ── Folder group list ── */}
			<div className="flex-1 overflow-auto px-8 py-4 flex flex-col gap-4">
				{groups.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-4">
						<p className="text-[13px] font-semibold text-[var(--theme-accent)] font-barlow tracking-[0.06em]">
							No same-folder duplicates found
						</p>
						<button
							type="button"
							onClick={handleNewScan}
							className="mt-2 px-5 py-2 rounded border border-[var(--theme-border)] bg-transparent text-[var(--theme-text-secondary)] text-[11px] font-bold tracking-[0.06em] uppercase font-barlow cursor-pointer"
						>
							Run New Scan
						</button>
					</div>
				) : filteredGroups.length === 0 ? (
					<div className="flex items-center justify-center p-16">
						<p className="text-[12px] font-semibold text-[var(--theme-text-secondary)] font-barlow tracking-[0.06em] uppercase">
							No results — adjust search
						</p>
					</div>
				) : (
					<>
						{filteredGroups.map((group) => {
							const collapsed = collapsedFolders.has(group.folderId);
							const folderSelectedCount = selectedCountInFolder(group);

							return (
								<div key={group.folderId} className="flex flex-col">
									{/* Folder heading card */}
									<button
										type="button"
										onClick={() => toggleFolder(group.folderId)}
										className={cn(
											"flex items-center justify-between px-5 py-[14px] cursor-pointer border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] w-full text-left transition-colors duration-150",
											collapsed ? "rounded-[10px]" : "rounded-t-[10px]",
										)}
									>
										<div className="flex items-center gap-[10px]">
											<div className="w-8 h-8 rounded-[7px] bg-[var(--theme-folder-path-bg)] border border-[var(--theme-folder-path-border)] flex items-center justify-center shrink-0">
												<FolderIcon
													size={16}
													className="text-[var(--theme-accent)]"
												/>
											</div>
											<div className="flex flex-col">
												<span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--theme-text-secondary)] font-barlow">
													Same Folder
												</span>
												<span className="text-[13px] font-bold font-jetbrains text-[var(--theme-text-primary)]">
													<FolderName folderId={group.folderId} />
												</span>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<span className="text-[10px] font-bold font-barlow px-2 py-[3px] rounded-sm border bg-[var(--theme-same-folder-bg)] text-[var(--theme-same-folder-text)] border-[var(--theme-same-folder-border)]">
												{group.sets.length} duplicate set
												{group.sets.length !== 1 ? "s" : ""}
											</span>
											<span className="text-[10px] font-bold font-barlow px-2 py-[3px] rounded-sm bg-[var(--theme-count-badge-bg)] text-[var(--theme-count-badge-text)]">
												{formatBytes(group.totalWastedBytes)} recoverable
											</span>
											{folderSelectedCount > 0 && (
												<span className="text-[10px] font-bold font-barlow px-2 py-[3px] rounded-sm bg-[var(--theme-accent)] text-[var(--theme-accent-contrast)]">
													{folderSelectedCount} selected
												</span>
											)}
											<ChevronDown
												size={14}
												className={cn(
													"text-[var(--theme-caret-color)] transition-transform duration-200 ml-1",
													collapsed ? "-rotate-90" : "rotate-0",
												)}
											/>
										</div>
									</button>

									{/* Nested sets container */}
									{!collapsed && (
										<div className="border border-t-0 border-[var(--theme-card-border)] rounded-b-[10px] px-4 pb-4 pt-3 bg-[var(--theme-card-bg)]">
											{/* Context strip */}
											<div className="flex items-center gap-2 pb-[10px] mb-3 border-b border-[var(--theme-expanded-border)]">
												<FolderIcon
													size={11}
													className="text-[var(--theme-text-secondary)] shrink-0"
												/>
												<span className="text-[10px] font-jetbrains text-[var(--theme-text-secondary)]">
													All files below are located in
												</span>
												<span className="text-[10px] font-bold font-jetbrains text-[var(--theme-accent)]">
													<FolderName folderId={group.folderId} />
												</span>
											</div>

											{/* Duplicate sets */}
											<div className="flex flex-col gap-2">
												{group.sets.map((set) => {
													const setExpanded = expandedSets.has(set.key);
													const allInSetSelected = allSelectedInSet(set);
													const setSelectedCount =
														selectedCountInSet(set);
													const isSetSelected = setSelectedCount > 0;
													const confidenceColor =
														CONFIDENCE_COLORS[theme][set.confidence];

													return (
														<div
															key={set.key}
															className={cn(
																"rounded-[8px] border overflow-hidden",
																isSetSelected
																	? "border-[var(--theme-card-border-sel)]"
																	: "border-[var(--theme-card-border)]",
															)}
															style={{
																background:
																	"var(--theme-expanded-bg)",
															}}
														>
															{/* Set header */}
															<div
																className="flex items-center border-l-[3px]"
																style={{
																	borderLeftColor:
																		confidenceColor.border,
																}}
															>
																<div className="px-3 py-[13px] shrink-0">
																	<FileIcon
																		size={13}
																		className="text-[var(--theme-accent)]"
																	/>
																</div>

																<button
																	type="button"
																	className="flex-1 py-[13px] cursor-pointer min-w-0 text-left"
																	onClick={() =>
																		toggleSet(set.key)
																	}
																>
																	<div className="flex items-center gap-2 mb-1">
																		<span
																			className="text-[10px] font-bold font-barlow px-2 py-[3px] rounded-sm border tracking-[0.08em] uppercase whitespace-nowrap"
																			style={{
																				background:
																					confidenceColor.bg,
																				borderColor:
																					confidenceColor.border,
																				color: confidenceColor.text,
																			}}
																		>
																			{confidenceColor.label}
																		</span>
																		<span className="text-[10px] font-bold font-barlow px-2 py-[3px] rounded-sm bg-[var(--theme-count-badge-bg)] text-[var(--theme-count-badge-text)] whitespace-nowrap">
																			{set.files.length} files
																		</span>
																		{setSelectedCount > 0 && (
																			<span
																				className={cn(
																					"text-[10px] font-bold font-barlow px-2 py-[3px] rounded-sm border whitespace-nowrap",
																					allInSetSelected
																						? "bg-[var(--theme-warn-bg)] text-[var(--theme-warn-text)] border-[var(--theme-warn-border)]"
																						: "border-[var(--theme-card-border-sel)] text-[var(--theme-accent)]",
																				)}
																				style={
																					!allInSetSelected
																						? {
																								background:
																									"var(--theme-file-sel-bg)",
																							}
																						: undefined
																				}
																			>
																				{setSelectedCount}{" "}
																				selected
																				{allInSetSelected
																					? " · keep 1!"
																					: ""}
																			</span>
																		)}
																	</div>
																	<div className="text-[12px] font-jetbrains text-[var(--theme-filename-text)] overflow-hidden text-ellipsis whitespace-nowrap max-w-[360px]">
																		{set.files[0]?.name}
																	</div>
																</button>

																<div className="px-[18px] py-[13px] text-right shrink-0">
																	<div className="text-[10px] uppercase tracking-[0.06em] text-[var(--theme-text-dim)] font-barlow mb-0.5">
																		RECLAIM
																	</div>
																	<div className="text-[16px] font-extrabold font-barlow-condensed text-[var(--theme-accent)]">
																		{formatBytes(
																			set.totalWastedBytes,
																		)}
																	</div>
																</div>

																<button
																	type="button"
																	className="pl-0 pr-4 py-[13px] cursor-pointer shrink-0"
																	onClick={() =>
																		toggleSet(set.key)
																	}
																>
																	<ChevronDown
																		size={14}
																		className={cn(
																			"text-[var(--theme-caret-color)] transition-transform duration-200",
																			setExpanded
																				? "rotate-180"
																				: "rotate-0",
																		)}
																	/>
																</button>
															</div>

															{/* Expanded file list */}
															{setExpanded && (
																<div
																	className="border-t border-[var(--theme-expanded-border)]"
																	style={{
																		background:
																			"var(--theme-expanded-bg)",
																	}}
																>
																	{allInSetSelected && (
																		<div
																			className="flex items-center gap-2 px-[14px] py-2 border-b border-[var(--theme-warn-border)]"
																			style={{
																				background:
																					"var(--theme-warn-bg)",
																			}}
																		>
																			<CircleAlertIcon
																				size={13}
																				stroke="#f5a623"
																			/>
																			<p className="text-[10px] font-semibold text-[var(--theme-warn-text)] font-barlow">
																				Deselect at least
																				one file to keep it
																				— all files are
																				currently selected
																				for deletion.
																			</p>
																		</div>
																	)}
																	{set.files.map((file, i) => {
																		const fileKey = `${set.key}::${i}`;
																		const isSelected =
																			selectedFiles.has(
																				fileKey,
																			);
																		return (
																			<div
																				key={file.id}
																				className={cn(
																					"flex items-center gap-[10px] pl-[44px] pr-[14px] py-[10px] transition-colors duration-150",
																					i <
																						set.files
																							.length -
																							1 &&
																						"border-b border-[var(--theme-file-row-border)]",
																				)}
																				style={{
																					background:
																						isSelected
																							? "var(--theme-file-sel-bg)"
																							: "transparent",
																				}}
																			>
																				<input
																					type="checkbox"
																					checked={
																						isSelected
																					}
																					onChange={() =>
																						toggleFile(
																							set.key,
																							i,
																						)
																					}
																					className="shrink-0"
																				/>
																				<FileIcon
																					size={13}
																					className={
																						isSelected
																							? "text-[var(--theme-accent)] shrink-0"
																							: "text-[var(--theme-file-icon-color)] shrink-0"
																					}
																				/>
																				<span
																					className={cn(
																						"flex-1 text-[12px] font-jetbrains overflow-hidden text-ellipsis whitespace-nowrap min-w-0",
																						isSelected
																							? "font-semibold text-[var(--theme-body-text)]"
																							: "font-normal text-[var(--theme-filename-text)]",
																					)}
																				>
																					{file.name}
																				</span>
																				<span className="text-[11px] font-semibold font-jetbrains text-[var(--theme-size-text)] whitespace-nowrap">
																					{formatBytes(
																						file.size,
																					)}
																				</span>
																				<span className="text-[11px] text-[var(--theme-date-text)] whitespace-nowrap">
																					{formatDate(
																						file.modifiedTime,
																					)}
																				</span>
																			</div>
																		);
																	})}
																</div>
															)}
														</div>
													);
												})}
											</div>
										</div>
									)}
								</div>
							);
						})}

						{!successMessage && (
							<div className="text-center pt-2 pb-2">
								<button
									type="button"
									onClick={handleNewScan}
									className="text-[11px] font-bold text-[var(--theme-text-secondary)] bg-transparent border-none cursor-pointer tracking-[0.06em] uppercase font-barlow"
								>
									Run New Scan
								</button>
							</div>
						)}
					</>
				)}
			</div>

			{showModal && (
				<DeleteModal
					files={allSelectedRecords}
					totalBytes={totalSelectedBytes}
					onConfirm={handleConfirmDelete}
					onCancel={() => setShowModal(false)}
					isPending={deleteMutation.isPending}
				/>
			)}
		</div>
	);
}
