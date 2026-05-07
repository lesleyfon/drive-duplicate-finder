import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { trashFile } from "../lib/driveApi";
import { readScanCache, writeScanCache } from "../lib/scanCache";
import { runSequentially } from "../lib/sequentially";
import { useScanStore } from "../store/scanStore";

export function useDeleteFiles() {
	const { accessToken } = useAuth();

	return useMutation({
		mutationFn: (fileIds: string[]) =>
			accessToken
				? runSequentially(fileIds, (id) => trashFile(accessToken, id))
				: Promise.reject(new Error("Not authenticated")),
		onSuccess: ({ succeeded }) => {
			useScanStore.getState().removeFiles(succeeded);

			// Keep the localStorage cache in sync so deleted IDs don't persist as stale base data
			const cache = readScanCache();
			if (cache && succeeded.length > 0) {
				const deletedSet = new Set(succeeded);
				writeScanCache({
					...cache,
					files: cache.files.filter((f) => !deletedSet.has(f.id)),
				});
			}
		},
	});
}
