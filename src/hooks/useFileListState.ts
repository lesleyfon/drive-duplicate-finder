import { useMemo, useState } from "react";
import { formatBytes } from "../lib/formatters";
import type { FileRecord } from "../types/drive";
import { useDeleteFiles } from "./useDeleteFiles";

export interface UseFileListStateOptions<S extends string> {
	files: FileRecord[];
	defaultSort: S;
	sortFn: (files: FileRecord[], sort: S) => FileRecord[];
}

export interface UseFileListStateReturn<S extends string> {
	selected: Set<string>;
	sort: S;
	setSort: (s: S) => void;
	search: string;
	setSearch: (s: string) => void;
	showModal: boolean;
	setShowModal: (v: boolean) => void;
	successMessage: string | null;
	errorMessage: string | null;
	visibleFiles: FileRecord[];
	allVisibleSelected: boolean;
	selectedFiles: FileRecord[];
	totalSelectedBytes: number;
	hasSelection: boolean;
	toggleSelect: (id: string) => void;
	toggleSelectAll: () => void;
	handleConfirmDelete: () => Promise<void>;
	isPending: boolean;
}

export function useFileListState<S extends string>({
	files,
	defaultSort,
	sortFn,
}: UseFileListStateOptions<S>): UseFileListStateReturn<S> {
	const deleteMutation = useDeleteFiles();

	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [sort, setSort] = useState<S>(defaultSort);
	const [search, setSearch] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const visibleFiles = useMemo(() => {
		let result = [...files];
		if (search.trim()) {
			const query = search.trim().toLowerCase();
			result = result.filter(
				(file) =>
					file.name.toLowerCase().includes(query) ||
					file.mimeType.toLowerCase().includes(query) ||
					(file.fullFileExtension ?? "").toLowerCase().includes(query),
			);
		}
		return sortFn(result, sort);
	}, [files, sort, search, sortFn]);

	const allVisibleSelected =
		visibleFiles.length > 0 &&
		visibleFiles.every((file) => selected.has(file.id));

	const toggleSelect = (id: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const toggleSelectAll = () => {
		const ids = visibleFiles.map((file) => file.id);
		setSelected((prev) => {
			const next = new Set(prev);
			if (allVisibleSelected) {
				ids.forEach((id) => {
					next.delete(id);
				});
			} else {
				ids.forEach((id) => {
					next.add(id);
				});
			}
			return next;
		});
	};

	const selectedFiles = files.filter((file) => selected.has(file.id));
	const totalSelectedBytes = selectedFiles.reduce(
		(s, file) => s + (file.size ?? 0),
		0,
	);
	const hasSelection = selected.size > 0;

	const handleConfirmDelete = async () => {
		const ids = Array.from(selected);
		const freedBytes = selectedFiles.reduce(
			(total, f) => total + (f.size ?? 0),
			0,
		);
		try {
			const result = await deleteMutation.mutateAsync(ids);
			setShowModal(false);
			setSelected(new Set());
			setSuccessMessage(
				`Deleted ${result.succeeded.length} file${result.succeeded.length !== 1 ? "s" : ""}. ${formatBytes(freedBytes)} freed.${result.failed.length > 0 ? ` ${result.failed.length} failed.` : ""}`,
			);
		} catch {
			setShowModal(false);
			setErrorMessage("Something went wrong. Please try again.");
		}
	};

	return {
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
		isPending: deleteMutation.isPending,
	};
}
