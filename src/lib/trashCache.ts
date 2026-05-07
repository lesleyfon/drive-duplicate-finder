import { createDriveCache } from "./driveCache";

import type { FileRecord } from "../types/drive";

export interface TrashCache {
	lastFetchedAt: string;
	files: FileRecord[];
}

const { read: readTrashCache, write: writeTrashCache, clear: clearTrashCache } =
	createDriveCache<TrashCache>("drive-dup-finder:trash-cache");

export { clearTrashCache, readTrashCache, writeTrashCache };
