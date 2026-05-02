import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { trashFile } from "../lib/driveApi";
import { useScanStore } from "../store/scanStore";

interface DeleteResult {
	succeeded: string[];
	failed: { fileId: string; error: string }[];
}

async function deleteSequentially(
	token: string,
	fileIds: string[],
): Promise<DeleteResult> {
	const succeeded: string[] = [];
	const failed: { fileId: string; error: string }[] = [];

	for (const fileId of fileIds) {
		try {
			await trashFile(token, fileId);
			succeeded.push(fileId);
		} catch (err) {
			failed.push({ fileId, error: (err as Error).message });
		}
		// 100ms delay between calls to respect rate limits
		if (fileIds.indexOf(fileId) < fileIds.length - 1) {
			await new Promise((r) => setTimeout(r, 100));
		}
	}

	return { succeeded, failed };
}

export function useDeleteFiles() {
	const { accessToken } = useAuth();

	return useMutation({
		mutationFn: (fileIds: string[]) =>
			accessToken
				? deleteSequentially(accessToken, fileIds)
				: Promise.reject(new Error("Not authenticated")),
		onSuccess: ({ succeeded }) => {
			useScanStore.getState().removeFiles(succeeded);
		},
	});
}
