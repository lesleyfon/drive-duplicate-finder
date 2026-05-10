import type { FileRecord } from "../types/drive";
import { createDriveCache } from "./driveCache";

export interface TrashCache {
	lastFetchedAt: string;
	files: FileRecord[];
}

const {
	read: readTrashCache,
	write: writeTrashCache,
	clear: clearTrashCache,
} = createDriveCache<TrashCache>("drive-dup-finder:trash-cache");

export { clearTrashCache, readTrashCache, writeTrashCache };
