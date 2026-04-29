import type {
	ConfidenceLevel,
	DuplicateGroup,
	FileRecord,
	RecentFileEntry,
	ScanResult,
} from "../types/drive";

const GOOGLE_APPS_PREFIX = "application/vnd.google-apps.";

function isExcluded(file: FileRecord): boolean {
	return file.mimeType.startsWith(GOOGLE_APPS_PREFIX);
}

const COPY_PATTERN = /\((\d+)\)$|^Copy of /i;

export function runDeduplication(allFiles: FileRecord[]): ScanResult {
	// Layer 1 — exclude non-comparable files
	const comparable: FileRecord[] = [];
	let excludedFiles = 0;
	for (const file of allFiles) {
		if (isExcluded(file)) {
			excludedFiles++;
		} else {
			comparable.push(file);
		}
	}

	// Layer 2 — group by MIME type
	const byMime = new Map<string, FileRecord[]>();
	for (const file of comparable) {
		const bucket = byMime.get(file.mimeType) ?? [];
		bucket.push(file);
		byMime.set(file.mimeType, bucket);
	}

	const groups: DuplicateGroup[] = [];

	for (const mimeFiles of byMime.values()) {
		// Layer 3 — group by size
		const bySize = new Map<number, FileRecord[]>();
		for (const file of mimeFiles) {
			if (file.size == null) continue;
			const bucket = bySize.get(file.size) ?? [];
			bucket.push(file);
			bySize.set(file.size, bucket);
		}

		for (const [size, sizeFiles] of bySize) {
			if (sizeFiles.length < 2) continue;

			// Layer 4 — exact match by MD5
			const byMd5 = new Map<string, FileRecord[]>();
			const noMd5: FileRecord[] = [];

			for (const file of sizeFiles) {
				if (file.md5Checksum) {
					const bucket = byMd5.get(file.md5Checksum) ?? [];
					bucket.push(file);
					byMd5.set(file.md5Checksum, bucket);
				} else {
					noMd5.push(file);
				}
			}

			for (const [checksum, md5Files] of byMd5) {
				if (md5Files.length >= 2) {
					groups.push(
						makeGroup(
							`exact:${md5Files[0].mimeType}:${size}:${checksum}`,
							"exact",
							md5Files,
						),
					);
				}
			}

			// Layer 5 — likely duplicate by name + size (no MD5 or different MD5)
			const remaining = [...noMd5];
			// Also collect files with MD5 that didn't form exact groups above
			for (const [, md5Files] of byMd5) {
				if (md5Files.length < 2) remaining.push(...md5Files);
			}

			const byName = new Map<string, FileRecord[]>();
			for (const file of remaining) {
				const bucket = byName.get(file.name) ?? [];
				bucket.push(file);
				byName.set(file.name, bucket);
			}

			for (const [name, nameFiles] of byName) {
				if (nameFiles.length >= 2) {
					groups.push(
						makeGroup(
							`likely:${nameFiles[0].mimeType}:${size}:${name}`,
							"likely",
							nameFiles,
						),
					);
				}
			}
		}

		// Layer 6 — "possible versions": same name, different sizes (advisory only)
		const byNameAll = new Map<string, FileRecord[]>();
		for (const file of mimeFiles) {
			const bucket = byNameAll.get(file.name) ?? [];
			bucket.push(file);
			byNameAll.set(file.name, bucket);
		}

		for (const [name, nameFiles] of byNameAll) {
			if (nameFiles.length < 2) continue;
			// Only include files not already in an exact or likely group
			const usedIds = new Set(groups.flatMap((g) => g.files.map((f) => f.id)));
			const unused = nameFiles.filter((f) => !usedIds.has(f.id));
			// Check they have different sizes
			const sizes = new Set(unused.map((f) => f.size));
			if (unused.length >= 2 && sizes.size > 1) {
				groups.push(
					makeGroup(
						`version:${nameFiles[0].mimeType}:${name}`,
						"version",
						unused,
					),
				);
			}
			// Advisory hints about copy patterns — included in the group metadata
			if (unused.some((f) => COPY_PATTERN.test(f.name))) {
				// Already surfaced via 'version' group above or exact/likely
			}
		}
	}

	// Sort groups: exact first, then likely, then version; within each by wasted bytes desc
	groups.sort((a, b) => {
		const order: Record<ConfidenceLevel, number> = {
			exact: 0,
			likely: 1,
			version: 2,
		};
		if (order[a.confidence] !== order[b.confidence])
			return order[a.confidence] - order[b.confidence];
		return b.totalWastedBytes - a.totalWastedBytes;
	});

	const fileGroupBytes = { image: 0, video: 0, audio: 0, document: 0, other: 0 };
	for (const file of allFiles) {
		if (file.size == null) continue;
		fileGroupBytes[classifyMime(file.mimeType)] += file.size;
	}

	const recentFiles: RecentFileEntry[] = [...allFiles]
		.sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime))
		.slice(0, 8)
		.map((f) => ({
			id: f.id,
			name: f.name,
			mimeType: f.mimeType,
			size: f.size ?? 0,
			modifiedTime: f.modifiedTime,
			webViewLink: f.webViewLink,
		}));

	return {
		totalFilesScanned: allFiles.length,
		excludedFiles,
		duplicateGroups: groups,
		scannedAt: new Date(),
		fileGroupBytes,
		recentFiles,
	};
}

function classifyMime(mimeType: string): "image" | "video" | "audio" | "document" | "other" {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType.startsWith("audio/")) return "audio";
	if (
		mimeType === "application/pdf" ||
		mimeType.startsWith("text/") ||
		mimeType.includes("word") ||
		mimeType.includes("document")
	)
		return "document";
	return "other";
}

function makeGroup(
	key: string,
	confidence: ConfidenceLevel,
	files: FileRecord[],
): DuplicateGroup {
	const baseSize = files[0].size ?? 0;
	return {
		key,
		confidence,
		files,
		totalWastedBytes: (files.length - 1) * baseSize,
		selectedForDeletion: new Set<string>(),
		keepFileId: null,
	};
}
