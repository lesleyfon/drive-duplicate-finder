import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
	enrichWithTrashedTimes,
	listTrashedFilesPage,
	untrashFile,
} from "../lib/driveApi";
import { runSequentially } from "../lib/sequentially";

import type { InfiniteData } from "@tanstack/react-query";
import type { SequentialResult } from "../lib/sequentially";
import type { TrashedFilePage } from "../lib/driveApi";
import type { FileRecord } from "../types/drive";

export type RestoreResult = SequentialResult;

export function useListTrashedFiles() {
	const { accessToken } = useAuth();
	const queryClient = useQueryClient();

	const query = useInfiniteQuery({
		queryKey: ["trashedFiles"],
		queryFn: async ({ pageParam }) => {
			const page = await listTrashedFilesPage(
				accessToken ?? "",
				pageParam as string | undefined,
			);

			// Fire enrichment without blocking — patch cache when it resolves
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
				},
			);
			return page; // ← resolves immediately, list renders now
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextPageToken,
		enabled: !!accessToken,
		staleTime: Infinity,
		gcTime: Infinity,
	});

	const { status, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

	useEffect(() => {
		if (status === "success" && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [status, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allFiles: FileRecord[] =
		query.data?.pages.flatMap((p) => p.files) ?? [];

	return { ...query, allFiles };
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
		},
	});
}
