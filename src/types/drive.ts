export interface FileRecord {
	id: string;
	name: string;
	mimeType: string;
	// Size in bytes
	size: number | null;
	md5Checksum: string | null;
	createdTime: string;
	modifiedTime: string;
	owners: { displayName: string; emailAddress: string; me: boolean }[];
	parents: string[];
	webViewLink: string;
	thumbnailLink: string | null;
	fullFileExtension: string | null;
	trashed: boolean;
}

export type ConfidenceLevel = "exact" | "likely" | "version";

export interface DuplicateGroup {
	key: string;
	confidence: ConfidenceLevel;
	files: FileRecord[];
	totalWastedBytes: number;
	selectedForDeletion: Set<string>;
	keepFileId: string | null;
}

export interface RecentFileEntry {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	modifiedTime: string;
	webViewLink: string;
}

export interface SameFolderGroup {
	folderId: string;
	sets: DuplicateGroup[];
	totalWastedBytes: number;
}

export interface ScanResult {
	totalFilesScanned: number;
	excludedFiles: number;
	duplicateGroups: DuplicateGroup[];
	sameFolderGroups: SameFolderGroup[];
	scannedAt: Date;
	fileGroupBytes: {
		image: number;
		video: number;
		audio: number;
		document: number;
		other: number;
	};
	recentFiles: RecentFileEntry[];
}
