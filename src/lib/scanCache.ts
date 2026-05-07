import type { FileRecord } from "../types/drive";

export interface ScanCache {
	lastFetchedAt: string;
	files: FileRecord[];
	scanScope: { folderId: string; folderName: string } | null;
}

const CACHE_KEY = "drive-dup-finder:scan-cache";
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB, to avoid exceeding localStorage limits and to prevent performance issues with large caches
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * The function `readScanCache` reads and validates a cached scan data from localStorage, returning it
 * if valid and not expired.
 * @returns The `readScanCache` function returns either a `ScanCache` object if the cached data is
 * valid and not expired, or `null` if the cached data is missing, invalid, or older than 30 days.
 */
export function readScanCache(): ScanCache | null {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const cache = JSON.parse(raw) as ScanCache;
		// Basic validation to ensure cache has expected shape and isn't just some random string that happens to be valid JSON
		if (!cache.files?.length) {
			return null;
		}
		// Invalidate cache if it's older than 30 days, to avoid stale data and to keep localStorage usage in check
		const age = Date.now() - new Date(cache.lastFetchedAt).getTime();
		if (Number.isNaN(age) || age > THIRTY_DAYS_MS) {
			return null;
		}
		return cache;
	} catch {
		return null;
	}
}

/**
 * The function `writeScanCache` serializes a `ScanCache` object to JSON and stores it in the browser's
 * `localStorage`, with a fallback to a full scan if the cache size exceeds a certain limit.
 * @param {ScanCache} cache - The `cache` parameter is an object of type `ScanCache` that contains data
 * to be stored in the cache.
 * @returns If the cache exceeds 4 MB, a warning message is logged and the function returns without
 * writing to localStorage. Otherwise, the cache is serialized and stored in the localStorage with the
 * key specified by CACHE_KEY.
 */
export function writeScanCache(cache: ScanCache): void {
	try {
		const serialized = JSON.stringify(cache);
		if (new Blob([serialized]).size > MAX_BYTES) {
			console.warn(
				"[scanCache] Cache exceeds 4 MB — skipping write, falling back to full scan.",
			);
			return;
		}
		localStorage.setItem(CACHE_KEY, serialized);
	} catch {
		// localStorage unavailable or quota exceeded
	}
}

/**
 * The function `clearScanCache` removes an item from the localStorage with the key `CACHE_KEY`.
 */
export function clearScanCache(): void {
	try {
		localStorage.removeItem(CACHE_KEY);
	} catch {
		// ignore
	}
}
