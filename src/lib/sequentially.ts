export interface SequentialResult {
	succeeded: string[];
	failed: { fileId: string; error: string }[];
}

export async function runSequentially(
	fileIds: string[],
	operate: (fileId: string) => Promise<void>,
	delayMs = 100,
): Promise<SequentialResult> {
	const succeeded: string[] = [];
	const failed: { fileId: string; error: string }[] = [];

	for (let i = 0; i < fileIds.length; i++) {
		const fileId = fileIds[i];
		try {
			await operate(fileId);
			succeeded.push(fileId);
		} catch (err) {
			failed.push({ fileId, error: (err as Error).message });
		}
		if (i < fileIds.length - 1) {
			await new Promise((r) => setTimeout(r, delayMs));
		}
	}

	return { succeeded, failed };
}
