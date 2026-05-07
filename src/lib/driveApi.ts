import type { FileRecord } from "../types/drive";

const BASE = "https://www.googleapis.com/drive/v3";
const ACTIVITY_BASE = "https://driveactivity.googleapis.com/v2";

function authHeaders(token: string) {
	return { Authorization: `Bearer ${token}` };
}

const mapFileRecord = (f: Partial<FileRecord>) => ({
	id: f.id ?? "",
	name: f.name ?? "",
	mimeType: f.mimeType ?? "",
	size: f.size != null ? Number(f.size) : null,
	md5Checksum: f.md5Checksum ?? null,
	createdTime: f.createdTime ?? "",
	modifiedTime: f.modifiedTime ?? "",
	owners: f.owners ?? [],
	parents: f.parents ?? [],
	webViewLink: f.webViewLink ?? "",
	thumbnailLink: f.thumbnailLink ?? null,
	fullFileExtension: f.fullFileExtension ?? null,
	trashed: f.trashed ?? true,
	trashedTime: f?.trashedTime,
});

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		const err = new Error(
			body?.error?.message ?? `Drive API error ${res.status}`,
		) as Error & {
			status: number;
		};
		(err as { status: number }).status = res.status;
		throw err;
	}
	return res.json() as Promise<T>;
}

// 6.1 — Storage quota
export async function getStorageQuota(token: string) {
	const res = await fetch(`${BASE}/about?fields=storageQuota`, {
		headers: authHeaders(token),
	});
	const data = await handleResponse<{
		storageQuota: { limit: string; usage: string; usageInDrive: string };
	}>(res);
	return {
		limit: Number(data.storageQuota.limit),
		usage: Number(data.storageQuota.usage),
		usageInDrive: Number(data.storageQuota.usageInDrive),
	};
}

// 6.2 — List files page
export interface FilePage {
	files: FileRecord[];
	nextPageToken?: string;
}

// Drive API requires RFC 3339 without milliseconds for modifiedTime comparisons
function toRFC3339NoMs(iso: string): string {
	return iso.replace(/\.\d+Z$/, "Z");
}

export async function listFilesPage(
	token: string,
	pageToken?: string,
	folderId?: string, // preparation for issue 04 (folder-scoped scanning) — unused for now
	modifiedSince?: string,
): Promise<FilePage> {
	const qParts = ["trashed=false"];
	if (folderId) qParts.push(`'${folderId}' in parents`);
	if (modifiedSince)
		qParts.push(`modifiedTime > '${toRFC3339NoMs(modifiedSince)}'`);

	const params = new URLSearchParams({
		pageSize: "1000",
		fields:
			"nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,owners,parents,webViewLink,thumbnailLink,fullFileExtension,trashed)",
		q: qParts.join(" and "),
		supportsAllDrives: "true",
		includeItemsFromAllDrives: "true",
	});
	if (pageToken) params.set("pageToken", pageToken);

	const res = await fetch(`${BASE}/files?${params}`, {
		headers: authHeaders(token),
	});
	const data = await handleResponse<{
		files: Partial<FileRecord>[];
		nextPageToken?: string;
	}>(res);

	const files: FileRecord[] = data.files
		.filter((f) => f.owners?.some((o) => o.me)) // Only include files owned by the user, to avoid duplicates and permission issues
		.map(mapFileRecord);

	return { files, nextPageToken: data.nextPageToken };
}

// 6.2a — List files modified since a given time (for incremental scan deletion detection)
// NOTE (v1 limitation): filters by modifiedTime, not by trash action time. A file trashed
// without recent edits will have an old modifiedTime and won't appear in incremental scans.
export async function listRecentlyTrashedPage(
	token: string,
	since: string,
	pageToken?: string,
): Promise<FilePage> {
	const qParts = ["trashed=true"];
	if (since) qParts.push(`modifiedTime > '${toRFC3339NoMs(since)}'`);

	const params = new URLSearchParams({
		pageSize: "1000",
		fields:
			"nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,owners,parents,webViewLink,thumbnailLink,fullFileExtension,trashed)",
		q: qParts.join(" and "),
		supportsAllDrives: "true",
		includeItemsFromAllDrives: "true",
	});
	if (pageToken) params.set("pageToken", pageToken);

	const res = await fetch(`${BASE}/files?${params}`, {
		headers: authHeaders(token),
	});
	const data = await handleResponse<{
		files: Partial<FileRecord>[];
		nextPageToken?: string;
	}>(res);

	const files: FileRecord[] = data.files
		.filter((f) => f.owners?.some((o) => o.me))
		.map(mapFileRecord);

	return { files, nextPageToken: data.nextPageToken };
}

// 6.3 — Trash a file
export async function trashFile(token: string, fileId: string): Promise<void> {
	const res = await fetch(`${BASE}/files/${fileId}?supportsAllDrives=true`, {
		method: "PATCH",
		headers: {
			...authHeaders(token),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ trashed: true }),
	});
	await handleResponse<unknown>(res);
}

async function getTrashedTime(
	token: string,
	fileId: string,
): Promise<string | undefined> {
	try {
		const res = await fetch(`${ACTIVITY_BASE}/activity:query`, {
			method: "POST",
			headers: {
				...authHeaders(token),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				itemName: `items/${fileId}`,
				filter: "detail.action_detail_case:DELETE",
			}),
		});

		if (!res.ok) return undefined;

		const data = await res.json();
		const activities: any[] = data.activities ?? [];

		// Find the most recent TRASH action (array comes back newest-first)
		const trashActivity = activities.find(
			(a) => a.primaryActionDetail?.delete?.type === "TRASH",
		);

		if (!trashActivity) return undefined;

		return trashActivity.timestamp ?? trashActivity.timeRange?.endTime;
	} catch {
		return undefined;
	}
}

export async function enrichWithTrashedTimes(
	token: string,
	files: FileRecord[],
	concurrency = 10,
): Promise<FileRecord[]> {
	const trashedMap = new Map<string, string | undefined>();

	// Process in chunks to respect rate limits
	for (let i = 0; i < files.length; i += concurrency) {
		const chunk = files.slice(i, i + concurrency);
		const results = await Promise.allSettled(
			chunk.map((f) =>
				getTrashedTime(token, f.id).then((t) => ({ id: f.id, trashedTime: t })),
			),
		);

		for (const result of results) {
			if (result.status === "fulfilled") {
				trashedMap.set(result.value.id, result.value.trashedTime);
			}
		}
	}

	return files.map((f) => ({
		...f,
		trashedTime: trashedMap.get(f.id) ?? f.trashedTime,
	}));
}

// 6.4 — List trashed files page
export interface TrashedFilePage {
	files: FileRecord[];
	nextPageToken?: string;
}
export async function listTrashedFilesPage(
	token: string,
	pageToken?: string,
): Promise<TrashedFilePage> {
	const params = new URLSearchParams({
		pageSize: "100",
		fields:
			"nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,owners,parents,webViewLink,thumbnailLink,fullFileExtension,trashed,trashedTime)",
		q: "trashed=true",
		orderBy: "modifiedTime desc",
		supportsAllDrives: "true",
		includeItemsFromAllDrives: "true",
	});
	if (pageToken) params.set("pageToken", pageToken);

	const res = await fetch(`${BASE}/files?${params}`, {
		headers: authHeaders(token),
	});

	const data = await handleResponse<{
		files: Partial<FileRecord>[];
		nextPageToken?: string;
	}>(res);

	const files: FileRecord[] = data.files
		.filter((f) => f.owners?.some((o) => o.me))
		.map(mapFileRecord);

	return {
		files: files,
		nextPageToken: data.nextPageToken,
	};
}

// 6.5 — Restore a trashed file
export async function untrashFile(
	token: string,
	fileId: string,
): Promise<void> {
	const res = await fetch(`${BASE}/files/${fileId}?supportsAllDrives=true`, {
		method: "PATCH",
		headers: {
			...authHeaders(token),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ trashed: false }),
	});
	await handleResponse<unknown>(res);
}

// 6.6 — Get folder name
export async function getFolderName(
	token: string,
	folderId: string,
): Promise<string> {
	const res = await fetch(
		`${BASE}/files/${folderId}?fields=id,name&supportsAllDrives=true`,
		{
			headers: authHeaders(token),
		},
	);
	const data = await handleResponse<{ name: string }>(res);
	return data.name;
}
