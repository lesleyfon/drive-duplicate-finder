import type { FileRecord } from "../types/drive";
import type { FilePage } from "./driveApi";

export async function paginateAll(
	fetcher: (pageToken?: string) => Promise<FilePage>,
): Promise<FileRecord[]> {
	const all: FileRecord[] = [];
	let pageToken: string | undefined;
	do {
		const page = await fetcher(pageToken);
		all.push(...page.files);
		pageToken = page.nextPageToken;
	} while (pageToken);
	return all;
}
