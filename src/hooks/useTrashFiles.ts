import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
	enrichWithTrashedTimes,
	listTrashedFilesPage,
	untrashFile,
} from "../lib/driveApi";
import { runSequentially } from "../lib/sequentially";
import { readTrashCache, writeTrashCache } from "../lib/trashCache";

import type { InfiniteData } from "@tanstack/react-query";
import type { SequentialResult } from "../lib/sequentially";
import type { TrashedFilePage } from "../lib/driveApi";
import type { FileRecord } from "../types/drive";

export type RestoreResult = SequentialResult;

export function useListTrashedFiles() {
	const { accessToken } = useAuth();
	const queryClient = useQueryClient();

	// Read cache once on init (same pattern as useScanFiles)
	const cacheRef = useRef<ReturnType<typeof readTrashCache> | undefined>(undefined);
	if (cacheRef.current === undefined && !!accessToken) {
		cacheRef.current = readTrashCache();
	}
	const hasCache = !!cacheRef.current?.files.length;

	const query = useInfiniteQuery({
		queryKey: ["trashedFiles"],
		queryFn: async ({ pageParam }) => {
			const page = await listTrashedFilesPage(
				accessToken ?? "",
				pageParam as string | undefined,
			);

			// Fire enrichment without blocking — patch React Query and persist when it resolves.
			// Writing here (not just in the effect) ensures the cache is updated even if the
			// component unmounts before enrichment finishes.
			enrichWithTrashedTimes(accessToken ?? "", page.files).then(
				(enrichedFiles) => {
					queryClient.setQueryData<InfiniteData<TrashedFilePage>>(
						["trashedFiles"],
						(old) => {
							if (!old) return old;
							const pageIndex = old.pageParams.indexOf(pageParam);
							if (pageIndex === -1) return old;
							const newPages = [...old.pages];
							newPages[pageIndex] = {
								...newPages[pageIndex],
								files: enrichedFiles,
							};
							return { ...old, pages: newPages };
						},
					);
					const updated = queryClient.getQueryData<InfiniteData<TrashedFilePage>>(["trashedFiles"]);
					if (updated) {
						writeTrashCache({
							lastFetchedAt: new Date().toISOString(),
							files: updated.pages.flatMap((p) => p.files),
						});
					}
				},
			);
			return page;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: !!accessToken,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	const { status, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

	// Auto-fetch remaining pages
	useEffect(() => {
		if (status === "success" && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [status, hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Write cache when all pages are loaded (enrichment writes its own updates above)
	useEffect(() => {
		if (status === "success" && !hasNextPage && !query.isFetching && query.data) {
			const allFiles = query.data.pages.flatMap((p) => p.files);
			writeTrashCache({ lastFetchedAt: new Date().toISOString(), files: allFiles });
		}
	}, [status, hasNextPage, query.isFetching, query.data]);

	// While the query is loading, show cached files so the page is instant
	const isQueryComplete = status === "success" && !hasNextPage && !query.isFetching;
	const isShowingCache = hasCache && !isQueryComplete && status !== "error";

	const allFiles: FileRecord[] = isShowingCache
		? (cacheRef.current?.files ?? [])
		: (query.data?.pages.flatMap((p) => p.files) ?? []);

	return {
		...query,
		allFiles,
		// Override status/pagination so the component treats cached data as loaded
		status: isShowingCache ? ("success" as const) : query.status,
		hasNextPage: isShowingCache ? false : hasNextPage,
		isFetchingNextPage: isShowingCache ? false : isFetchingNextPage,
		// True while cached results are shown but a fresh fetch is still in progress
		isRefreshing: isShowingCache && query.isFetching,
	};
}

export function useRestoreFiles() {
	const { accessToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation<SequentialResult, Error, string[]>({
		mutationFn: (fileIds) =>
			accessToken
				? runSequentially(fileIds, (id) => untrashFile(accessToken, id))
				: Promise.reject(new Error("Not authenticated")),
		onSuccess: ({ succeeded }) => {
			const successSet = new Set(succeeded);
			queryClient.setQueryData<InfiniteData<TrashedFilePage>>(
				["trashedFiles"],
				(old) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							files: page.files.filter((f) => !successSet.has(f.id)),
						})),
					};
				},
			);
			// Sync localStorage from React Query state rather than re-reading localStorage,
			// so a concurrent cache write can't be rolled back by a stale read.
			const updated = queryClient.getQueryData<InfiniteData<TrashedFilePage>>(["trashedFiles"]);
			const cache = readTrashCache();
			if (cache && updated) {
				writeTrashCache({
					...cache,
					files: updated.pages.flatMap((p) => p.files),
				});
			}
		},
	});
}
