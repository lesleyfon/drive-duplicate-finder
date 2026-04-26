import type { FileRecord } from "../types/drive";

const BASE = "https://www.googleapis.com/drive/v3";

function authHeaders(token: string) {
	return { Authorization: `Bearer ${token}` };
}

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

export async function listFilesPage(
	token: string,
	pageToken?: string,
): Promise<FilePage> {
	const params = new URLSearchParams({
		pageSize: "1000",
		fields:
			"nextPageToken,files(id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,owners,parents,webViewLink,fullFileExtension,trashed)",
		q: "trashed=false",
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

	const files: FileRecord[] = data.files.map((f) => ({
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
		fullFileExtension: f.fullFileExtension ?? null,
		trashed: f.trashed ?? false,
	}));

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

// 6.4 — Get folder name
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
