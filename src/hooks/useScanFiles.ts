import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "../context/AuthContext";
import { listFilesPage } from "../lib/driveApi";
import type { FileRecord } from "../types/drive";
import { runDeduplication } from "../lib/deduplicator";
import { useScanStore } from "../store/scanStore";

export function useScanFiles(enabled: boolean) {
	const { accessToken } = useAuth();
	const startTimeRef = useRef<number | null>(null);

	const { status: storeStatus, totalFiles: storeTotalFiles, startScan, updateProgress, completeScan, setScanError } =
		useScanStore();
	const isAlreadyComplete = storeStatus === "complete";

	const query = useInfiniteQuery({
		queryKey: ["scanFiles"],
		queryFn: async ({ pageParam }) => {
			if (!startTimeRef.current) startTimeRef.current = Date.now();
			return listFilesPage(accessToken ?? "", pageParam as string | undefined);
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: enabled && !!accessToken && !isAlreadyComplete,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	const { data, hasNextPage, isFetchingNextPage, fetchNextPage, status } = query;

	// Kick off scan when enabled and store is idle
	useEffect(() => {
		if (enabled && storeStatus === "idle") {
			startScan();
		}
	}, [enabled, storeStatus, startScan]);

	// Auto-fetch all pages
	useEffect(() => {
		if (status === "success" && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [status, hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Track progress after each page
	useEffect(() => {
		if (data) {
			updateProgress(data.pages.flatMap((p) => p.files).length);
		}
	}, [data, updateProgress]);

	// Run deduplication once all pages are fetched
	useEffect(() => {
		if (status === "success" && !hasNextPage && data) {
			const allFiles: FileRecord[] = data.pages.flatMap((p) => p.files);
			completeScan(runDeduplication(allFiles));
		}
	}, [status, hasNextPage, data, completeScan]);

	// Surface query errors to the store
	useEffect(() => {
		if (query.isError && query.error) {
			setScanError(query.error as Error);
		}
	}, [query.isError, query.error, setScanError]);

	const totalFiles = isAlreadyComplete
		? storeTotalFiles
		: (data?.pages.flatMap((p) => p.files).length ?? 0);

	const estimatedTimeRemaining = (() => {
		if (!startTimeRef.current || !data || data.pages.length < 2) return null;
		if (!hasNextPage) return 0;
		const elapsed = (Date.now() - startTimeRef.current) / 1000;
		void elapsed;
		return null;
	})();

	return {
		...query,
		totalFiles,
		estimatedTimeRemaining,
		isComplete: isAlreadyComplete || (status === "success" && !hasNextPage),
	};
}
