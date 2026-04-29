import { formatBytes, formatTime, getMimeColor } from "../lib/formatters";
import type { RecentFileEntry, ScanResult } from "../types/drive";

interface Props {
	scanResults: ScanResult | null;
}

export function RecentFileActivity({ scanResults }: Props) {
	const recentFiles = scanResults?.recentFiles ?? null;

	return (
		<div className="border border-border-dim bg-surface-low flex flex-col">
			<div className="px-5 py-3 border-b border-border-dim flex items-center justify-between">
				<p className="text-nav uppercase tracking-widest text-text-primary">
					RECENT_FILE_ACTIVITY
				</p>
				<span className="px-2 py-0.5 border border-status-ok text-status-ok text-label uppercase tracking-widest">
					Storage Size
				</span>
			</div>

			<div className="flex flex-col divide-y divide-border-dim">
				{recentFiles
					? recentFiles.map((file) => <RecentFileRow key={file.id} file={file} />)
					: Array.from({ length: 8 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: As this is a static skeleton, using index as key is fine
							<div key={i} className="flex items-center gap-3 px-5 py-3 opacity-20">
								<div className="w-16 h-3 bg-surface-top" />
								<div className="w-3 h-3 bg-surface-top" />
								<div className="flex-1 h-3 bg-surface-top" />
								<div className="w-16 h-3 bg-surface-top" />
							</div>
						))}
			</div>
		</div>
	);
}

function RecentFileRow({ file }: { file: RecentFileEntry }) {
	return (
		<a
			href={file.webViewLink}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-3 px-5 py-3 hover:bg-surface-high transition-colors group"
		>
			<span className="text-label text-text-muted flex-shrink-0 w-16 font-mono">
				{formatTime(file.modifiedTime)}
			</span>
			<span
				className="w-3 h-3 flex-shrink-0"
				style={{ backgroundColor: getMimeColor(file.mimeType) }}
			/>
			<span className="text-sm text-text-secondary truncate flex-1 group-hover:text-text-primary transition-colors">
				{file.name}
			</span>
			<span className="text-sm text-text-muted flex-shrink-0 text-right w-16">
				{formatBytes(file.size)}
			</span>
		</a>
	);
}
