import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "../context/AuthContext";
import { runDeduplication } from "../lib/deduplicator";
import { listFilesPage, listRecentlyTrashedPage } from "../lib/driveApi";
import { paginateAll } from "../lib/paginateAll";
import { readScanCache, writeScanCache } from "../lib/scanCache";
import { useScanStore } from "../store/scanStore";
import type { FileRecord } from "../types/drive";

export function useScanFiles(enabled: boolean) {
	const { accessToken } = useAuth();
	const startTimeRef = useRef<number | null>(null);

	const {
		status: storeStatus,
		totalFiles: storeTotalFiles,
		startScan,
		updateProgress,
		completeScan,
		setScanError,
		setScanMode,
		setCachedAt,
	} = useScanStore();

	const isAlreadyComplete = storeStatus === "complete";

	// Determine scan mode once, synchronously, before any queries are set up
	const modeInitRef = useRef(false);
	const scanModeRef = useRef<"full" | "incremental">("full");
	const cachedFilesRef = useRef<FileRecord[]>([]);
	const modifiedSinceRef = useRef<string | undefined>(undefined);
	const cacheLastFetchedAtRef = useRef<string | null>(null);

	if (enabled && accessToken && !isAlreadyComplete && !modeInitRef.current) {
		modeInitRef.current = true;
		const cache = readScanCache();
		// scanScope is always null until folder-scoped scanning (issue 04) is implemented
		if (cache && cache.scanScope === null) {
			scanModeRef.current = "incremental";
			cachedFilesRef.current = cache.files;
			cacheLastFetchedAtRef.current = cache.lastFetchedAt;
			// Apply 60s clock-skew buffer so near-simultaneous changes aren't missed
			const adjusted = new Date(
				new Date(cache.lastFetchedAt).getTime() - 60_000,
			);
			modifiedSinceRef.current = adjusted.toISOString();
		}
	}

	const isIncremental = scanModeRef.current === "incremental";

	// Full mode: page-by-page via useInfiniteQuery
	const fullQuery = useInfiniteQuery({
		queryKey: ["scanFiles", "full"],
		queryFn: async ({ pageParam }) => {
			if (!startTimeRef.current) startTimeRef.current = Date.now();
			return listFilesPage(accessToken ?? "", pageParam as string | undefined);
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: enabled && !!accessToken && !isAlreadyComplete && !isIncremental,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	// Incremental mode: single query that fetches changed + trashed pages internally
	const incrementalQuery = useQuery({
		queryKey: ["scanFiles", "incremental"],
		queryFn: async () => {
			if (!startTimeRef.current) startTimeRef.current = Date.now();
			const since = modifiedSinceRef.current ?? "";
			const [changedFiles, trashedFiles] = await Promise.all([
				paginateAll((pt) =>
					listFilesPage(accessToken ?? "", pt, undefined, since),
				),
				paginateAll((pt) =>
					listRecentlyTrashedPage(accessToken ?? "", since, pt),
				),
			]);
			return { changedFiles, trashedFiles };
		},
		enabled: enabled && !!accessToken && !isAlreadyComplete && isIncremental,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	// Start scan and write mode to store
	useEffect(() => {
		if (enabled && storeStatus === "idle") {
			startScan();
			setScanMode(scanModeRef.current);
			if (
				scanModeRef.current === "incremental" &&
				cacheLastFetchedAtRef.current
			) {
				setCachedAt(cacheLastFetchedAtRef.current);
			}
		}
	}, [enabled, storeStatus, startScan, setScanMode, setCachedAt]);

	// Full mode: auto-fetch remaining pages
	useEffect(() => {
		if (
			fullQuery.status === "success" &&
			fullQuery.hasNextPage &&
			!fullQuery.isFetchingNextPage
		) {
			fullQuery.fetchNextPage();
		}
	}, [
		fullQuery.status,
		fullQuery.hasNextPage,
		fullQuery.isFetchingNextPage,
		fullQuery.fetchNextPage,
	]);

	// Full mode: progress tracking
	useEffect(() => {
		if (fullQuery.data) {
			updateProgress(fullQuery.data.pages.flatMap((p) => p.files).length);
		}
	}, [fullQuery.data, updateProgress]);

	// Full mode: completion + cache write
	useEffect(() => {
		if (
			fullQuery.status === "success" &&
			!fullQuery.hasNextPage &&
			fullQuery.data
		) {
			const allFiles = fullQuery.data.pages.flatMap((p) => p.files);
			const now = new Date().toISOString();
			if (
				writeScanCache({ lastFetchedAt: now, files: allFiles, scanScope: null })
			) {
				setCachedAt(now);
			}
			completeScan(runDeduplication(allFiles));
		}
	}, [
		fullQuery.status,
		fullQuery.hasNextPage,
		fullQuery.data,
		completeScan,
		setCachedAt,
	]);

	// Incremental mode: completion + merge + cache write
	useEffect(() => {
		if (incrementalQuery.status === "success" && incrementalQuery.data) {
			const { changedFiles, trashedFiles } = incrementalQuery.data;
			const trashedIds = new Set(trashedFiles.map((f) => f.id));
			const changedById = new Map(changedFiles.map((f) => [f.id, f]));
			const cachedIds = new Set(cachedFilesRef.current.map((f) => f.id));

			// v1 limitation: files deleted via "Delete forever" (bypassing trash) are not
			// returned by the Drive API as changed or trashed, so they remain in the cache
			// until the next full scan. A future fix could cross-reference Drive's file count.

			// Remove trashed, update modified files in-place
			const merged: FileRecord[] = cachedFilesRef.current
				.filter((f) => !trashedIds.has(f.id))
				.map((f) => changedById.get(f.id) ?? f);

			// Append brand-new files (in changedFiles but not previously cached)
			for (const f of changedFiles) {
				if (!cachedIds.has(f.id) && !trashedIds.has(f.id)) merged.push(f);
			}

			const now = new Date().toISOString();
			if (
				writeScanCache({ lastFetchedAt: now, files: merged, scanScope: null })
			) {
				setCachedAt(now);
			}
			completeScan(runDeduplication(merged));
		}
	}, [
		incrementalQuery.status,
		incrementalQuery.data,
		completeScan,
		setCachedAt,
	]);

	// Error handling
	useEffect(() => {
		if (fullQuery.isError && fullQuery.error) {
			setScanError(fullQuery.error as Error);
		}
	}, [fullQuery.isError, fullQuery.error, setScanError]);

	useEffect(() => {
		if (incrementalQuery.isError && incrementalQuery.error) {
			setScanError(incrementalQuery.error as Error);
		}
	}, [incrementalQuery.isError, incrementalQuery.error, setScanError]);

	const isFetching = isIncremental
		? incrementalQuery.isFetching
		: fullQuery.isFetching;
	const isFetchingNextPage = isIncremental
		? false
		: fullQuery.isFetchingNextPage;
	const isError = fullQuery.isError || incrementalQuery.isError;
	const error = fullQuery.error ?? incrementalQuery.error;

	const totalFiles = isAlreadyComplete
		? storeTotalFiles
		: isIncremental
			? cachedFilesRef.current.length
			: (fullQuery.data?.pages.flatMap((p) => p.files).length ?? 0);

	const isComplete =
		isAlreadyComplete ||
		(isIncremental
			? incrementalQuery.status === "success"
			: fullQuery.status === "success" && !fullQuery.hasNextPage);

	return {
		isFetching,
		isFetchingNextPage,
		isError,
		error,
		totalFiles,
		isComplete,
		estimatedTimeRemaining: null,
	};
}
