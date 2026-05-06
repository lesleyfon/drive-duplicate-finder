import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteModal } from "../components/DeleteModal";
import { DuplicateGroupCard } from "../components/DuplicateGroupCard";
import { useDeleteFiles } from "../hooks/useDeleteFiles";
import { cn } from "../lib/cn";
import { formatBytes } from "../lib/formatters";
import { useScanStore } from "../store/scanStore";
import type { DuplicateGroup, FileRecord } from "../types/drive";
import { NoResult } from "../components/no-result";

export const Route = createFileRoute("/results")({
	component: ResultsPage,
});

const CATEGORY_LABELS: Record<string, { breadcrumb: string; title: string }> = {
	duplicates: { breadcrumb: "DUPLICATE FILES", title: "DUPLICATE SCANNER" },
	hidden: { breadcrumb: "HIDDEN FILES", title: "HIDDEN FILES" },
	empty: { breadcrumb: "EMPTY FILES", title: "EMPTY FILES" },
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

type ConfidenceFilter = "all" | "exact" | "likely" | "version";
type SortType = "size" | "copies" | "type" | "name";

const FILTER_TABS: { key: ConfidenceFilter; label: string }[] = [
	{ key: "all", label: "All Types" },
	{ key: "exact", label: "Exact Match" },
	{ key: "likely", label: "Likely Duplicates" },
	{ key: "version", label: "Versions" },
];

function DuplicatesView() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const scanResult = useScanStore((s) => s.scanResults);
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
		if (confidenceFilter === "likely") result = result.filter((g) => g.confidence === "likely");
		if (confidenceFilter === "version")
			result = result.filter((g) => g.confidence === "version");

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter((g) => g.files.some((f) => f.name.toLowerCase().includes(q)));
		}

		return [...result].sort((a, b) => {
			if (sort === "size") return b.totalWastedBytes - a.totalWastedBytes;
			if (sort === "copies") return b.files.length - a.files.length;
			if (sort === "type") return a.files[0].mimeType.localeCompare(b.files[0].mimeType);
			if (sort === "name") return a.files[0].name.localeCompare(b.files[0].name);
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
		const updated = useScanStore.getState().scanResults;
		if (updated) setGroups(updated.duplicateGroups);
		const freed = allSelectedFiles.reduce((sum, f) => sum + (f.size ?? 0), 0);
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
		return <NoResult title="Duplicate Files" description="No scan data — run a scan first" />;
	}

	const totalRecoverableBytes = groups.reduce((s, g) => s + g.totalWastedBytes, 0);
	const totalExtraFiles = groups.reduce((s, g) => s + (g.files.length - 1), 0);
	const hasSelection = allSelectedFiles.length > 0;

	return (
		<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
			{/* ── Top bar ── */}
			<div className="h-14 px-8 flex items-center gap-6 bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-topbar-border)] shrink-0">
				{/* Left: label */}
				<div className="flex items-center gap-2">
					<span className="text-[13px] font-semibold text-[var(--theme-text-primary)] tracking-[0.05em] uppercase font-barlow">
						Duplicate Files
					</span>
				</div>

				{/* Center: stats */}
				<div className="flex-1 flex justify-center gap-5 text-[12px] text-[var(--theme-text-secondary)] font-barlow">
					<span>
						<b className="text-[var(--theme-text-primary)] text-[13px]">
							{groups.length}
						</b>{" "}
						groups
					</span>
					<span>
						<b className="text-[var(--theme-text-primary)] text-[13px]">
							{totalExtraFiles}
						</b>{" "}
						extra files
					</span>
					<span>
						<b className="text-[var(--theme-accent)] text-[13px]">
							{formatBytes(totalRecoverableBytes)}
						</b>{" "}
						recoverable
					</span>
				</div>

				{/* Right: sort + delete */}
				<div className="flex items-center gap-3">
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
							? `Delete ${allSelectedFiles.length} selected`
							: "Delete selected"}
					</button>
				</div>
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

			{groups.length > 0 && (
				<>
					{/* ── Filter bar ── */}
					<div className="px-8 flex items-center gap-1 bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-topbar-border)] shrink-0">
						{FILTER_TABS.map(({ key, label }) => {
							const active = confidenceFilter === key;
							return (
								<button
									key={key}
									type="button"
									onClick={() => setConfidenceFilter(key)}
									className={cn(
										"px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase font-barlow border-none bg-transparent cursor-pointer transition-all duration-150",
										active
											? "text-[var(--theme-filter-active)] border-b-2 border-[var(--theme-filter-active)]"
											: "text-[var(--theme-filter-inactive)] border-b-2 border-transparent",
									)}
								>
									{label}
								</button>
							);
						})}
						<div>
							<label
								htmlFor="select-sort"
								className="text-[11px] font-bold tracking-[0.06em] uppercase font-barlow"
							>
								Sort By:
							</label>
							<select
								value={sort}
								id="select-sort"
								onChange={(e) => setSort(e.target.value as SortType)}
								className="text-[11px] font-bold tracking-[0.06em] uppercase font-barlow border border-[var(--theme-topbar-border)] bg-[var(--theme-search-bg)] text-[var(--theme-text-secondary)] px-[10px] py-[5px] rounded cursor-pointer"
							>
								<option value="size">Largest first</option>
								<option value="copies">Most copies</option>
								<option value="type">File type</option>
								<option value="name">Name</option>
							</select>
						</div>
						<div className="flex-1" />

						{/* Search */}
						<div className="flex items-center gap-2 bg-[var(--theme-search-bg)] border border-[var(--theme-topbar-border)] rounded px-3 py-[6px]">
							<SearchIcon width="13" height="13" viewBox="0 0 24 24" />
							<input
								type="text"
								placeholder="Search filename…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="border-none bg-transparent text-[12px] text-[var(--theme-body-text)] outline-none w-[140px] font-barlow"
							/>
						</div>
					</div>

					{/* ── Group list ── */}
					<div className="flex-1 overflow-auto px-8 py-6 flex flex-col gap-3">
						{filteredGroups.length === 0 ? (
							<div className="flex-1 flex items-center justify-center p-16">
								<p className="text-[12px] font-semibold text-[var(--theme-text-secondary)] font-barlow tracking-[0.06em] uppercase">
									No results — adjust filters
								</p>
							</div>
						) : (
							filteredGroups.map((group) => (
								<DuplicateGroupCard
									key={group.key}
									group={group}
									onGroupChange={handleGroupChange}
								/>
							))
						)}

						{/* New scan link at bottom */}
						{!successMessage && (
							<div className="text-center pt-2">
								<button
									type="button"
									onClick={handleNewScan}
									className="text-[11px] font-bold text-[var(--theme-text-secondary)] bg-transparent border-none cursor-pointer tracking-[0.06em] uppercase font-barlow"
								>
									Run New Scan
								</button>
							</div>
						)}
					</div>
				</>
			)}

			{/* Empty / clean state */}
			{groups.length === 0 && (
				<div className="flex-1 flex flex-col items-center justify-center gap-4">
					<p className="text-[13px] font-semibold text-[var(--theme-accent)] font-barlow tracking-[0.06em]">
						No duplicates found — your Drive is clean
					</p>
					<p className="text-[12px] text-[var(--theme-text-secondary)] font-barlow">
						{scanResult.totalFilesScanned.toLocaleString()} files scanned
					</p>
					<button
						type="button"
						onClick={handleNewScan}
						className="mt-2 px-5 py-2 rounded border border-[var(--theme-border)] bg-transparent text-[var(--theme-text-secondary)] text-[11px] font-bold tracking-[0.06em] uppercase font-barlow cursor-pointer"
					>
						Run New Scan
					</button>
				</div>
			)}

			{/* Delete confirmation modal */}
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

	if (filter !== "duplicates") return <StubPage filter={filter} />;

	return <DuplicatesView />;
}
