import { create } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { persist } from "zustand/middleware";
import type { DuplicateGroup, ScanResult } from "../types/drive";
import type {
	PersistedState,
	ScanState,
	ScanStatus,
	SerializedDuplicateGroup,
	SerializedScanResult,
} from "./../types/scan-store.ts";

/**
 * The `serializeGroup` function takes a `DuplicateGroup` object and returns a
 * `SerializedDuplicateGroup` object with an empty array for the `selectedForDeletion` property.
 * @param {DuplicateGroup} group - The `group` parameter is of type `DuplicateGroup`, which is an
 * object representing a group of duplicate items.
 */
const serializeGroup = (group: DuplicateGroup): SerializedDuplicateGroup => ({
	...group,
	selectedForDeletion: [],
});

/**
 * The `deserializeGroup` function takes a serialized duplicate group and returns a `DuplicateGroup`
 * object with an empty `selectedForDeletion` set.
 * @param {SerializedDuplicateGroup} group - The `group` parameter is a serialized duplicate group that
 * contains information about duplicate items.
 */
const deserializeGroup = (group: SerializedDuplicateGroup): DuplicateGroup => ({
	...group,
	selectedForDeletion: new Set<string>(),
});

/**
 * The function `serializeScanResult` serializes a `ScanResult` object into a `SerializedScanResult`
 * object by converting dates to ISO strings and mapping duplicate and same folder groups to their
 * serialized versions.
 * @param {ScanResult} result - The `result` parameter is an object of type `ScanResult` that contains
 * information about a scan result. It likely includes properties such as `scannedAt` (a Date object),
 * `duplicateGroups` (an array of groups containing duplicate items), and `sameFolderGroups` (an array
 * @returns The function `serializeScanResult` takes a `ScanResult` object as input and returns a
 * `SerializedScanResult` object. The returned object includes the properties of the input `ScanResult`
 * object, but with the `scannedAt` property converted to an ISO string, and the `duplicateGroups` and
 * `sameFolderGroups` properties mapped to serialized versions using the `serializeGroup` function
 */
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

/**
 * The function `deserializeScanResult` deserializes a serialized scan result object into a structured
 * `ScanResult` object.
 * @param {SerializedScanResult} serialized - The `deserializeScanResult` function takes a `serialized`
 * object of type `SerializedScanResult` as a parameter. This object likely contains data related to a
 * scan result that needs to be deserialized into a `ScanResult` object. The function performs various
 * transformations on the data within the `serialized
 * @returns The function `deserializeScanResult` is returning a `ScanResult` object. The function
 * deserializes a `SerializedScanResult` object by converting the `scannedAt` property to a `Date`
 * object, deserializing the `duplicateGroups` array using the `deserializeGroup` function, and
 * deserializing the `sameFolderGroups` array by mapping each element to an object with
 */
function deserializeScanResult(serialized: SerializedScanResult): ScanResult {
	return {
		...serialized,
		scannedAt: new Date(serialized.scannedAt),
		duplicateGroups: serialized.duplicateGroups.map(deserializeGroup),
		sameFolderGroups: (serialized.sameFolderGroups ?? []).map(
			(folderGroup) => ({
				...folderGroup,
				sets: folderGroup.sets.map(deserializeGroup),
			}),
		),
	};
}

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
	scanMode: null as "full" | "incremental" | null,
	cachedAt: null as string | null,
	sessionId: null as string | null,
	startedAt: null as number | null,
};

export const useScanStore = create<ScanState>()(
	persist(
		(set, get) => ({
			...initialState,

			startScan: () =>
				set({
					status: "scanning",
					scanResults: null,
					totalFiles: 0,
					errorMessage: null,
					scanMode: null,
					cachedAt: null,
					sessionId: `scn_${Math.random().toString(36).slice(2, 8)}`,
					startedAt: Date.now(),
				}),

			updateProgress: (totalFiles) => set({ totalFiles }),

			completeScan: (results) =>
				set({
					status: "complete",
					scanResults: results,
					totalFiles: results.totalFilesScanned,
				}),

			setScanError: (error) =>
				set({ status: "error", errorMessage: error.message }),

			resetScan: () => set(initialState),

			setScanMode: (mode) => set({ scanMode: mode }),

			setCachedAt: (ts) => set({ cachedAt: ts }),

			removeFiles: (fileIds) => {
				const { scanResults } = get();
				if (!scanResults) return;
				const deletedSet = new Set(fileIds);

				const updatedGroups = scanResults.duplicateGroups
					.map((group) => ({
						...group,
						files: group.files.filter((file) => !deletedSet.has(file.id)),
						selectedForDeletion: new Set(
							[...group.selectedForDeletion].filter(
								(id) => !deletedSet.has(id),
							),
						),
					}))
					.filter((group) => group.files.length >= 2);

				const updatedSameFolderGroups = (scanResults.sameFolderGroups ?? [])
					.map((folderGroup) => {
						const updatedSets = folderGroup.sets
							.map((set) => ({
								...set,
								files: set.files.filter((file) => !deletedSet.has(file.id)),
								selectedForDeletion: new Set(
									[...set.selectedForDeletion].filter(
										(id) => !deletedSet.has(id),
									),
								),
							}))
							.filter((s) => s.files.length >= 2);
						return {
							...folderGroup,
							sets: updatedSets,
							totalWastedBytes: updatedSets.reduce(
								(sum, s) => sum + s.totalWastedBytes,
								0,
							),
						};
					})
					.filter((folderGroup) => folderGroup.sets.length > 0);
				set({
					scanResults: {
						...scanResults,
						duplicateGroups: updatedGroups,
						sameFolderGroups: updatedSameFolderGroups,
						largeFiles: scanResults.largeFiles.filter(
							(file) => !deletedSet.has(file.id),
						),
						oldFiles: scanResults.oldFiles.filter(
							(file) => !deletedSet.has(file.id),
						),
						recentFiles: scanResults.recentFiles.filter(
							(file) => !deletedSet.has(file.id),
						),
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
