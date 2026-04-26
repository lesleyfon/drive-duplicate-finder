import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { NavBar } from "../components/NavBar";
import { DuplicateGroupCard } from "../components/DuplicateGroupCard";
import { DeleteModal } from "../components/DeleteModal";
import { useDeleteFiles } from "../hooks/useDeleteFiles";
import type { ScanResult, DuplicateGroup, FileRecord } from "../types/drive";
import { formatBytes } from "../lib/formatters";

export const Route = createFileRoute("/results")({
	component: ResultsPage,
});

type FilterType = "all" | "exact" | "likely";
type SortType = "size" | "copies" | "type";

function ResultsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const scanResult = queryClient.getQueryData<ScanResult>(["scanResults"]);

	const [groups, setGroups] = useState<DuplicateGroup[]>(() => scanResult?.duplicateGroups ?? []);
	const [filter, setFilter] = useState<FilterType>("all");
	const [sort, setSort] = useState<SortType>("size");
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const deleteMutation = useDeleteFiles();

	const filteredGroups = useMemo(() => {
		let result = groups;

		if (filter === "exact") result = result.filter((g) => g.confidence === "exact");
		else if (filter === "likely") result = result.filter((g) => g.confidence === "likely");

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
	}, [groups, filter, sort, search]);

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
		// Re-sync groups from query cache (mutation updates the cache)
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
			<div className="min-h-screen bg-gray-50">
				<NavBar />
				<main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
					<p className="text-gray-500">No scan results found.</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/dashboard" })}
						className="text-blue-600 underline text-sm"
					>
						Back to Dashboard
					</button>
				</main>
			</div>
		);
	}

	const totalRecoverableBytes = groups.reduce((s, g) => s + g.totalWastedBytes, 0);
	const totalExtraFiles = groups.reduce((s, g) => s + (g.files.length - 1), 0);

	return (
		<div className="min-h-screen bg-gray-50 pb-28">
			<NavBar />
			<main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
				{/* Success toast */}
				{successMessage && (
					<div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-3">
						<div className="flex items-center gap-2 text-green-800 text-sm">
							<CheckCircle2 className="w-4 h-4 flex-shrink-0" />
							{successMessage}
						</div>
						<button
							type="button"
							onClick={handleNewScan}
							className="text-sm font-medium text-green-700 hover:text-green-900 flex-shrink-0"
						>
							Run New Scan
						</button>
					</div>
				)}

				{/* Summary banner */}
				<div className="bg-white rounded-2xl border border-gray-200 p-5">
					{groups.length === 0 ? (
						<div className="text-center py-4 space-y-2">
							<CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
							<p className="font-semibold text-gray-800">
								No duplicates found! Your Drive is clean.
							</p>
							<p className="text-sm text-gray-500">
								Scanned {scanResult.totalFilesScanned.toLocaleString()} files (
								{scanResult.excludedFiles.toLocaleString()} Google Workspace files
								excluded).
							</p>
						</div>
					) : (
						<div className="flex flex-wrap gap-4 justify-between items-center">
							<div>
								<p className="font-semibold text-gray-900">
									Found {groups.length} duplicate group
									{groups.length !== 1 ? "s" : ""}
								</p>
								<p className="text-sm text-gray-500">
									{totalExtraFiles} extra files ·{" "}
									{formatBytes(totalRecoverableBytes)} recoverable ·{" "}
									{scanResult.totalFilesScanned.toLocaleString()} total scanned
								</p>
							</div>
							<button
								type="button"
								onClick={handleNewScan}
								className="text-sm text-blue-600 hover:text-blue-800 font-medium"
							>
								Run New Scan
							</button>
						</div>
					)}
				</div>

				{groups.length > 0 && (
					<>
						{/* Filter toolbar */}
						<div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-3 items-center">
							{/* Filter by confidence */}
							<div className="flex gap-1">
								{(["all", "exact", "likely"] as FilterType[]).map((f) => (
									<button
										type="button"
										key={f}
										onClick={() => setFilter(f)}
										className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
											filter === f
												? "bg-blue-100 text-blue-700"
												: "text-gray-600 hover:bg-gray-100"
										}`}
									>
										{f === "all" ? "All" : f === "exact" ? "Exact" : "Likely"}
									</button>
								))}
							</div>

							{/* Sort */}
							<select
								value={sort}
								onChange={(e) => setSort(e.target.value as SortType)}
								className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white"
							>
								<option value="size">Sort: Largest first</option>
								<option value="copies">Sort: Most copies</option>
								<option value="type">Sort: File type</option>
							</select>

							{/* Search */}
							<div className="flex-1 min-w-[160px] relative">
								<Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
								<input
									type="text"
									placeholder="Search by filename…"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
								/>
							</div>
						</div>

						{/* Duplicate group cards */}
						{filteredGroups.length === 0 ? (
							<p className="text-center text-gray-400 text-sm py-8">
								No groups match your filters.
							</p>
						) : (
							<div className="space-y-3">
								{filteredGroups.map((group) => (
									<DuplicateGroupCard
										key={group.key}
										group={group}
										onGroupChange={handleGroupChange}
									/>
								))}
							</div>
						)}
					</>
				)}
			</main>

			{/* Sticky delete bar */}
			{allSelectedFiles.length > 0 && (
				<div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
					<div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
						<p className="text-sm text-gray-700">
							<span className="font-semibold">
								{allSelectedFiles.length} file
								{allSelectedFiles.length !== 1 ? "s" : ""}
							</span>{" "}
							selected ·{" "}
							<span className="text-red-600 font-medium">
								{formatBytes(totalSelectedBytes)}
							</span>{" "}
							to free
						</p>
						<button
							type="button"
							onClick={() => setShowModal(true)}
							className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
						>
							Delete {allSelectedFiles.length} file
							{allSelectedFiles.length !== 1 ? "s" : ""} (
							{formatBytes(totalSelectedBytes)})
						</button>
					</div>
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
