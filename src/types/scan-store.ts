import type { DuplicateGroup, SameFolderGroup, ScanResult } from "./drive";

export type ScanStatus = "idle" | "scanning" | "complete" | "error";

export interface ScanState {
	status: ScanStatus;
	totalFiles: number;
	scanResults: ScanResult | null;
	errorMessage: string | null;
	scanMode: "full" | "incremental" | null;
	cachedAt: string | null;
	sessionId: string | null;
	startedAt: number | null;

	startScan: () => void;
	updateProgress: (totalFiles: number) => void;
	completeScan: (results: ScanResult) => void;
	setScanError: (error: Error) => void;
	resetScan: () => void;
	removeFiles: (fileIds: string[]) => void;
	setScanMode: (mode: "full" | "incremental") => void;
	setCachedAt: (ts: string) => void;
}

export interface SerializedDuplicateGroup
	extends Omit<DuplicateGroup, "selectedForDeletion"> {
	selectedForDeletion: string[];
}

export interface SerializedSameFolderGroup
	extends Omit<SameFolderGroup, "sets"> {
	sets: SerializedDuplicateGroup[];
}

export interface SerializedScanResult
	extends Omit<
		ScanResult,
		"scannedAt" | "duplicateGroups" | "sameFolderGroups"
	> {
	scannedAt: string;
	duplicateGroups: SerializedDuplicateGroup[];
	sameFolderGroups: SerializedSameFolderGroup[];
}

export type PersistedState = Pick<
	ScanState,
	"status" | "totalFiles" | "scanResults" | "errorMessage"
>;
