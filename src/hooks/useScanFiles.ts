import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "../context/AuthContext";
import { listFilesPage } from "../lib/driveApi";
import type { FileRecord } from "../types/drive";
import { runDeduplication } from "../lib/deduplicator";

export function useScanFiles(enabled: boolean) {
	const { accessToken } = useAuth();
	const queryClient = useQueryClient();
	const startTimeRef = useRef<number | null>(null);

	if (!accessToken) {
		throw new Error("useScanFiles must be used within an AuthProvider");
	}

	const query = useInfiniteQuery({
		queryKey: ["scanFiles"],
		queryFn: async ({ pageParam }) => {
			if (!startTimeRef.current) startTimeRef.current = Date.now();
			return listFilesPage(accessToken, pageParam as string | undefined);
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: enabled && !!accessToken,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	const { data, hasNextPage, isFetchingNextPage, fetchNextPage, status } =
		query;

	// Auto-fetch all pages
	useEffect(() => {
		if (status === "success" && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [status, hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Run deduplication once all pages are fetched
	useEffect(() => {
		if (status === "success" && !hasNextPage && data) {
			const allFiles: FileRecord[] = data.pages.flatMap((p) => p.files);
			const result = runDeduplication(allFiles);
			queryClient.setQueryData(["scanResults"], result);
		}
	}, [status, hasNextPage, data, queryClient]);

	const totalFiles = data?.pages.flatMap((p) => p.files).length ?? 0;

	const estimatedTimeRemaining = (() => {
		if (!startTimeRef.current || !data || data.pages.length < 2) return null;
		if (!hasNextPage) return 0;
		const elapsed = (Date.now() - startTimeRef.current) / 1000;
		// We don't know total file count, so we can't compute ETA
		void elapsed;
		return null;
	})();

	return {
		...query,
		totalFiles,
		estimatedTimeRemaining,
		isComplete: status === "success" && !hasNextPage,
	};
}
