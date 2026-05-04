import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import type { ScanResult, DuplicateGroup, SameFolderGroup } from "../types/drive";

export type ScanStatus = "idle" | "scanning" | "complete" | "error";

interface ScanState {
	status: ScanStatus;
	totalFiles: number;
	scanResults: ScanResult | null;
	errorMessage: string | null;

	startScan: () => void;
	updateProgress: (totalFiles: number) => void;
	completeScan: (results: ScanResult) => void;
	setScanError: (error: Error) => void;
	resetScan: () => void;
	removeFiles: (fileIds: string[]) => void;
}

interface SerializedDuplicateGroup extends Omit<DuplicateGroup, "selectedForDeletion"> {
	selectedForDeletion: string[];
}

interface SerializedSameFolderGroup extends Omit<SameFolderGroup, "sets"> {
	sets: SerializedDuplicateGroup[];
}

interface SerializedScanResult extends Omit<ScanResult, "scannedAt" | "duplicateGroups" | "sameFolderGroups"> {
	scannedAt: string;
	duplicateGroups: SerializedDuplicateGroup[];
	sameFolderGroups: SerializedSameFolderGroup[];
}

const serializeGroup = (g: DuplicateGroup): SerializedDuplicateGroup => ({
	...g,
	selectedForDeletion: [],
});

const deserializeGroup = (g: SerializedDuplicateGroup): DuplicateGroup => ({
	...g,
	selectedForDeletion: new Set<string>(),
});

function serializeScanResult(result: ScanResult): SerializedScanResult {
	return {
		...result,
		scannedAt: result.scannedAt.toISOString(),
		duplicateGroups: result.duplicateGroups.map(serializeGroup),
		sameFolderGroups: result.sameFolderGroups.map((fg) => ({
			...fg,
			sets: fg.sets.map(serializeGroup),
		})),
	};
}

function deserializeScanResult(serialized: SerializedScanResult): ScanResult {
	return {
		...serialized,
		scannedAt: new Date(serialized.scannedAt),
		duplicateGroups: serialized.duplicateGroups.map(deserializeGroup),
		sameFolderGroups: (serialized.sameFolderGroups ?? []).map((fg) => ({
			...fg,
			sets: fg.sets.map(deserializeGroup),
		})),
	};
}

type PersistedState = Pick<ScanState, "status" | "totalFiles" | "scanResults" | "errorMessage">;

interface SerializedPersistedState {
	status: ScanStatus;
	totalFiles: number;
	scanResults: SerializedScanResult | null;
	errorMessage: string | null;
}

const sessionStorageAdapter: PersistStorage<PersistedState> = {
	getItem(name) {
		const raw = sessionStorage.getItem(name);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StorageValue<SerializedPersistedState>;
		return {
			...parsed,
			state: {
				...parsed.state,
				scanResults: parsed.state.scanResults
					? deserializeScanResult(parsed.state.scanResults)
					: null,
			},
		};
	},
	setItem(name, value) {
		const serialized: StorageValue<SerializedPersistedState> = {
			...value,
			state: {
				...value.state,
				scanResults: value.state.scanResults
					? serializeScanResult(value.state.scanResults)
					: null,
			},
		};
		sessionStorage.setItem(name, JSON.stringify(serialized));
	},
	removeItem(name) {
		sessionStorage.removeItem(name);
	},
};

const initialState = {
	status: "idle" as ScanStatus,
	totalFiles: 0,
	scanResults: null,
	errorMessage: null,
};

export const useScanStore = create<ScanState>()(
	persist(
		(set, get) => ({
			...initialState,

			startScan: () =>
				set({ status: "scanning", scanResults: null, totalFiles: 0, errorMessage: null }),

			updateProgress: (totalFiles) => set({ totalFiles }),

			completeScan: (results) =>
				set({
					status: "complete",
					scanResults: results,
					totalFiles: results.totalFilesScanned,
				}),

			setScanError: (error) => set({ status: "error", errorMessage: error.message }),

			resetScan: () => set(initialState),

			removeFiles: (fileIds) => {
				const { scanResults } = get();
				if (!scanResults) return;
				const deletedSet = new Set(fileIds);
				const updatedGroups = scanResults.duplicateGroups
					.map((g) => ({
						...g,
						files: g.files.filter((f) => !deletedSet.has(f.id)),
						selectedForDeletion: new Set(
							[...g.selectedForDeletion].filter((id) => !deletedSet.has(id)),
						),
					}))
					.filter((g) => g.files.length >= 2);
				const updatedSameFolderGroups = (scanResults.sameFolderGroups ?? [])
					.map((fg) => {
						const updatedSets = fg.sets
							.map((s) => ({
								...s,
								files: s.files.filter((f) => !deletedSet.has(f.id)),
								selectedForDeletion: new Set(
									[...s.selectedForDeletion].filter((id) => !deletedSet.has(id)),
								),
							}))
							.filter((s) => s.files.length >= 2);
						return {
							...fg,
							sets: updatedSets,
							totalWastedBytes: updatedSets.reduce((sum, s) => sum + s.totalWastedBytes, 0),
						};
					})
					.filter((fg) => fg.sets.length > 0);
				set({
					scanResults: {
						...scanResults,
						duplicateGroups: updatedGroups,
						sameFolderGroups: updatedSameFolderGroups,
					},
				});
			},
		}),
		{
			name: "scan-store",
			storage: sessionStorageAdapter,
			partialize: (state) => ({
				status: state.status,
				totalFiles: state.totalFiles,
				scanResults: state.scanResults,
				errorMessage: state.errorMessage,
			}),
		},
	),
);
