import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, Trash2, Download } from "lucide-react";
import { DuplicateGroupCard } from "../components/DuplicateGroupCard";
import { DeleteModal } from "../components/DeleteModal";
import { useDeleteFiles } from "../hooks/useDeleteFiles";
import type { ScanResult, DuplicateGroup, FileRecord } from "../types/drive";
import { formatBytes } from "../lib/formatters";

export const Route = createFileRoute("/results")({
	component: ResultsPage,
});

const CATEGORY_LABELS: Record<string, { breadcrumb: string; title: string }> = {
	duplicates: { breadcrumb: "DUPLICATE FILES", title: "DUPLICATE SCANNER" },
	"same-folder": { breadcrumb: "SAME FOLDER", title: "SAME FOLDER" },
	hidden: { breadcrumb: "HIDDEN FILES", title: "HIDDEN FILES" },
	empty: { breadcrumb: "EMPTY FILES", title: "EMPTY FILES" },
	large: { breadcrumb: "LARGE FILES", title: "LARGE FILES" },
	old: { breadcrumb: "OLD FILES", title: "OLD FILES" },
	"not-owned": { breadcrumb: "NOT OWNED BY ME", title: "NOT OWNED" },
	type: { breadcrumb: "BY TYPE", title: "FILE TYPE" },
	"all-files": { breadcrumb: "ALL FILES", title: "ALL FILES" },
};

function StubPage({ filter }: { filter: string }) {
	const meta = CATEGORY_LABELS[filter] ?? {
		breadcrumb: filter.toUpperCase(),
		title: `${filter.toUpperCase()}.LOG`,
	};

	return (
		<div className="flex flex-col h-full">
			<div className="px-8 py-5 border-b border-border-dim">
				<p className="text-label uppercase tracking-widest text-text-muted mb-1">
					FILES BY CATEGORY / <span className="text-cyan-bright">{meta.breadcrumb}</span>
				</p>
				<h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
					{meta.title}
				</h1>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center gap-3 p-16">
				<p className="text-label uppercase tracking-widest text-text-muted">
					FEATURE STATUS: <span className="text-status-warn">COMING SOON</span>
				</p>
				<p className="text-sm text-text-muted">This category is not yet implemented.</p>
			</div>
		</div>
	);
}

type ConfidenceFilter = "all" | "exact" | "likely";
type SortType = "size" | "copies" | "type";

function DuplicatesView() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const scanResult = queryClient.getQueryData<ScanResult>(["scanResults"]);

	const [groups, setGroups] = useState<DuplicateGroup[]>(() => scanResult?.duplicateGroups ?? []);
	const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>("all");
	const [sort, setSort] = useState<SortType>("size");
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const deleteMutation = useDeleteFiles();

	const filteredGroups = useMemo(() => {
		let result = groups;

		if (confidenceFilter === "exact") result = result.filter((g) => g.confidence === "exact");
		else if (confidenceFilter === "likely")
			result = result.filter((g) => g.confidence === "likely");

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter((g) => g.files.some((f) => f.name.toLowerCase().includes(q)));
		}

		return [...result].sort((a, b) => {
			if (sort === "size") return b.totalWastedBytes - a.totalWastedBytes;
			if (sort === "copies") return b.files.length - a.files.length;
			if (sort === "type") return a.files[0].mimeType.localeCompare(b.files[0].mimeType);
			return 0;
		});
	}, [groups, confidenceFilter, sort, search]);

	const allSelectedFiles: FileRecord[] = useMemo(
		() =>
			groups
				.flatMap((g) =>
					[...g.selectedForDeletion].map((id) => g.files.find((f) => f.id === id)),
				)
				.filter((f): f is FileRecord => f !== undefined),
		[groups],
	);

	const totalSelectedBytes = allSelectedFiles.reduce((sum, f) => sum + (f.size ?? 0), 0);

	const handleGroupChange = (updated: DuplicateGroup) => {
		setGroups((prev) => prev.map((g) => (g.key === updated.key ? updated : g)));
	};

	const handleConfirmDelete = async () => {
		const ids = allSelectedFiles.map((f) => f.id);
		const result = await deleteMutation.mutateAsync(ids);
		setShowModal(false);
		const updated = queryClient.getQueryData<ScanResult>(["scanResults"]);
		if (updated) setGroups(updated.duplicateGroups);
		const freed = allSelectedFiles.reduce((sum, f) => sum + (f.size ?? 0), 0);
		setSuccessMessage(
			`Deleted ${result.succeeded.length} file${result.succeeded.length !== 1 ? "s" : ""}. ${formatBytes(freed)} freed.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ""}`,
		);
	};

	const handleNewScan = () => {
		queryClient.removeQueries({ queryKey: ["scanFiles"] });
		queryClient.removeQueries({ queryKey: ["scanResults"] });
		navigate({ to: "/scan" });
	};

	if (!scanResult) {
		return (
			<div className="flex flex-col h-full">
				<div className="px-8 py-5 border-b border-border-dim">
					<p className="text-label uppercase tracking-widest text-text-muted mb-1">
						FILES BY CATEGORY /{" "}
						<span className="text-cyan-bright">DUPLICATE FILES</span>
					</p>
					<h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
						DUPLICATE SCANNER
					</h1>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center gap-4 p-16">
					<p className="text-label uppercase tracking-widest text-text-muted">
						SCAN STATUS: <span className="text-status-warn">NO DATA</span>
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/dashboard" })}
						className="px-4 py-2 border border-border-bright text-text-secondary text-label uppercase tracking-widest hover:border-text-primary hover:text-text-primary transition-colors"
					>
						BACK TO DASHBOARD
					</button>
				</div>
			</div>
		);
	}

	const totalRecoverableBytes = groups.reduce((s, g) => s + g.totalWastedBytes, 0);
	const totalExtraFiles = groups.reduce((s, g) => s + (g.files.length - 1), 0);

	return (
		<div className="flex flex-col h-full">
			{/* Page header */}
			<div className="px-8 py-5 border-b border-border-dim flex items-center justify-between flex-shrink-0">
				<div>
					<p className="text-label uppercase tracking-widest text-text-muted mb-1">
						FILES BY CATEGORY /{" "}
						<span className="text-cyan-bright">DUPLICATE FILES</span>
					</p>
					<h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
						DUPLICATE SCANNER
					</h1>
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setShowModal(true)}
						disabled={allSelectedFiles.length === 0}
						className="flex items-center gap-2 px-4 py-2 bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						<Trash2 size={12} />
						BULK DELETE
					</button>
				</div>
			</div>

			{/* Success message */}
			{successMessage && (
				<div className="px-8 py-3 border-b border-border-dim flex items-center justify-between gap-4 bg-surface-low flex-shrink-0">
					<p className="text-label uppercase tracking-widest text-status-ok">
						{successMessage}
					</p>
					<button
						type="button"
						onClick={handleNewScan}
						className="text-label uppercase tracking-widest text-text-secondary hover:text-cyan-bright transition-colors flex-shrink-0"
					>
						RUN NEW SCAN
					</button>
				</div>
			)}

			{/* Summary */}
			<div className="px-8 py-4 border-b border-border-dim flex-shrink-0">
				{groups.length === 0 ? (
					<div className="flex items-center gap-6">
						<span className="text-label uppercase tracking-widest text-status-ok">
							SCAN STATUS: CLEAN
						</span>
						<span className="text-label uppercase tracking-widest text-text-muted">
							OBJECTS PARSED:{" "}
							<span className="text-text-secondary">
								{scanResult.totalFilesScanned.toLocaleString()}
							</span>
						</span>
					</div>
				) : (
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center gap-6 flex-wrap">
							<span className="text-label uppercase tracking-widest text-text-muted">
								GROUPS: <span className="text-text-primary">{groups.length}</span>
							</span>
							<span className="text-label uppercase tracking-widest text-text-muted">
								EXTRA_FILES:{" "}
								<span className="text-text-primary">{totalExtraFiles}</span>
							</span>
							<span className="text-label uppercase tracking-widest text-text-muted">
								RECOVERABLE:{" "}
								<span className="text-status-warn">
									{formatBytes(totalRecoverableBytes)}
								</span>
							</span>
							<span className="text-label uppercase tracking-widest text-text-muted">
								TOTAL SCANNED:{" "}
								<span className="text-text-secondary">
									{scanResult.totalFilesScanned.toLocaleString()}
								</span>
							</span>
						</div>
						<button
							type="button"
							onClick={handleNewScan}
							className="text-label uppercase tracking-widest text-text-muted hover:text-cyan-bright transition-colors"
						>
							RUN NEW SCAN
						</button>
					</div>
				)}
			</div>

			{groups.length > 0 && (
				<>
					{/* Filter toolbar */}
					<div className="px-8 py-3 border-b border-border-dim flex flex-wrap gap-4 items-center flex-shrink-0 bg-surface-dim">
						{/* Confidence filter */}
						<div className="flex">
							{(["all", "exact", "likely"] as ConfidenceFilter[]).map((f) => (
								<button
									type="button"
									key={f}
									onClick={() => setConfidenceFilter(f)}
									className={`px-3 py-1.5 text-label uppercase tracking-widest border transition-colors ${
										confidenceFilter === f
											? "bg-cyan-dark border-cyan-dim text-cyan-bright"
											: "border-border-dim text-text-muted hover:text-text-primary hover:border-border-bright"
									}`}
								>
									{f === "all" ? "ALL" : f === "exact" ? "EXACT" : "LIKELY"}
								</button>
							))}
						</div>

						{/* Sort */}
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortType)}
							className="text-label uppercase tracking-widest border border-border-dim bg-surface-dim text-text-secondary px-3 py-1.5 cursor-pointer hover:border-border-bright transition-colors"
						>
							<option value="size">SORT: LARGEST</option>
							<option value="copies">SORT: MOST COPIES</option>
							<option value="type">SORT: FILE TYPE</option>
						</select>

						{/* Search */}
						<div className="flex-1 min-w-[180px] relative">
							<Search className="w-3 h-3 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
							<input
								type="text"
								placeholder="SEARCH BY FILENAME..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full pl-8 pr-3 py-1.5 text-label uppercase tracking-widest border border-border-dim bg-surface-dim text-text-secondary placeholder-text-muted focus:border-cyan-bright"
							/>
						</div>
					</div>

					{/* Group list */}
					<div className="flex-1 overflow-y-auto">
						{filteredGroups.length === 0 ? (
							<div className="flex items-center justify-center p-16">
								<p className="text-label uppercase tracking-widest text-text-muted">
									NO RESULTS:{" "}
									<span className="text-text-secondary">ADJUST FILTERS</span>
								</p>
							</div>
						) : (
							<div>
								{filteredGroups.map((group) => (
									<DuplicateGroupCard
										key={group.key}
										group={group}
										onGroupChange={handleGroupChange}
									/>
								))}
							</div>
						)}
					</div>
				</>
			)}

			{/* Status bar */}
			<div className="border-t border-border-dim px-8 py-2 flex items-center gap-6 text-label uppercase tracking-widest flex-shrink-0 bg-surface-dim">
				<span className="text-text-muted">
					SCAN STATUS: <span className="text-status-ok">COMPLETED</span>
				</span>
				<span className="text-border-bright">|</span>
				<span className="text-text-muted">
					OBJECTS PARSED:{" "}
					<span className="text-text-secondary">
						{scanResult.totalFilesScanned.toLocaleString()}
					</span>
				</span>
			</div>

			{/* System selection panel */}
			{allSelectedFiles.length > 0 && (
				<div className="fixed bottom-6 right-6 bg-surface border border-cyan-dim p-5 w-52 z-40">
					<p className="text-label uppercase tracking-widest text-cyan-bright mb-2">
						SYSTEM SELECTION
					</p>
					<p className="text-[32px] font-bold leading-none text-text-primary mb-1">
						{allSelectedFiles.length}
					</p>
					<p className="text-label uppercase tracking-widest text-text-secondary mb-3">
						FILES MARKED
					</p>
					<p className="text-sm text-text-muted mb-4">
						SPACE TO FREE:{" "}
						<span className="text-text-primary">{formatBytes(totalSelectedBytes)}</span>
					</p>
					<button
						type="button"
						onClick={() => setShowModal(true)}
						className="w-full py-2 bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors"
					>
						EXECUTE WIPE
					</button>
				</div>
			)}

			{/* Delete modal */}
			{showModal && (
				<DeleteModal
					files={allSelectedFiles}
					totalBytes={totalSelectedBytes}
					onConfirm={handleConfirmDelete}
					onCancel={() => setShowModal(false)}
					isPending={deleteMutation.isPending}
				/>
			)}
		</div>
	);
}

function ResultsPage() {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.searchStr.replace(/^\?/, ""));
	const filter = searchParams.get("filter") ?? "duplicates";

	if (filter !== "duplicates") {
		return <StubPage filter={filter} />;
	}

	return <DuplicatesView />;
}
