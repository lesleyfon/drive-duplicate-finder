import type { FileRecord } from "../types/drive";

interface CacheShape {
	lastFetchedAt: string;
	files: FileRecord[];
}

const MAX_BYTES = 4 * 1024 * 1024;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function createDriveCache<T extends CacheShape>(cacheKey: string) {
	function read(): T | null {
		try {
			const raw = localStorage.getItem(cacheKey);
			if (!raw) return null;
			const cache = JSON.parse(raw) as T;
			if (!cache.files) return null;
			const age = Date.now() - new Date(cache.lastFetchedAt).getTime();
			if (Number.isNaN(age) || age < 0 || age > THIRTY_DAYS_MS) return null;
			return cache;
		} catch {
			return null;
		}
	}

	function write(cache: T): boolean {
		try {
			const serialized = JSON.stringify(cache);
			if (new Blob([serialized]).size > MAX_BYTES) {
				console.warn(
					`[driveCache] ${cacheKey}: exceeds 4 MB — skipping write.`,
				);
				return false;
			}
			localStorage.setItem(cacheKey, serialized);
			return true;
		} catch {
			// localStorage unavailable or quota exceeded
			return false;
		}
	}

	function clear(): void {
		try {
			localStorage.removeItem(cacheKey);
		} catch {
			// ignore
		}
	}

	return { read, write, clear };
}
