import type { FileRecord } from "../types/drive";
import { createDriveCache } from "./driveCache";

export interface ScanCache {
	lastFetchedAt: string;
	files: FileRecord[];
	scanScope: { folderId: string; folderName: string } | null;
}

const {
	read: readScanCache,
	write: writeScanCache,
	clear: clearScanCache,
} = createDriveCache<ScanCache>("drive-dup-finder:scan-cache");

export { clearScanCache, readScanCache, writeScanCache };
