import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { trashFile } from "../lib/driveApi";
import type { ScanResult } from "../types/drive";

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
	const queryClient = useQueryClient();

	if (!accessToken) {
		throw new Error("useDeleteFiles must be used within an AuthProvider");
	}
	return useMutation({
		mutationFn: (fileIds: string[]) => deleteSequentially(accessToken, fileIds),
		onSuccess: ({ succeeded }) => {
			// Remove deleted files from scan results
			queryClient.setQueryData<ScanResult>(["scanResults"], (prev) => {
				if (!prev) return prev;
				const deletedSet = new Set(succeeded);
				const updatedGroups = prev.duplicateGroups
					.map((group) => ({
						...group,
						files: group.files.filter((f) => !deletedSet.has(f.id)),
						selectedForDeletion: new Set(
							[...group.selectedForDeletion].filter(
								(id) => !deletedSet.has(id),
							),
						),
					}))
					.filter((group) => group.files.length >= 2);

				return {
					...prev,
					duplicateGroups: updatedGroups,
				};
			});
		},
	});
}
