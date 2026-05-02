import { formatBytes, getMimeColor } from "../lib/formatters";
import type { RecentFileEntry, ScanResult } from "../types/drive";
import {
	ClipboardList,
	Code,
	CornerDownRight,
	Database,
	ExternalLink,
	File,
	FileText,
	Folder,
	Globe,
	HelpCircle,
	Image,
	Layers,
	Mail,
	Map as MapIcon,
	Music,
	Presentation,
	Sparkles,
	Table,
	Video,
	type LucideIcon,
} from "lucide-react";

const MIME_ICONS: Record<string, LucideIcon> = {
	"application/vnd.google-apps.audio": Music,
	"application/vnd.google-apps.document": FileText,
	"application/vnd.google-apps.drive-sdk": ExternalLink,
	"application/vnd.google-apps.drawing": Presentation,
	"application/vnd.google-apps.file": File,
	"application/vnd.google-apps.folder": Folder,
	"application/vnd.google-apps.form": ClipboardList,
	"application/vnd.google-apps.fusiontable": Database,
	"application/vnd.google-apps.jam": Layers,
	"application/vnd.google-apps.mail-layout": Mail,
	"application/vnd.google-apps.map": MapIcon,
	"application/vnd.google-apps.photo": Image,
	"application/vnd.google-apps.presentation": Presentation,
	"application/vnd.google-apps.script": Code,
	"application/vnd.google-apps.shortcut": CornerDownRight,
	"application/vnd.google-apps.site": Globe,
	"application/vnd.google-apps.spreadsheet": Table,
	"application/vnd.google-apps.unknown": HelpCircle,
	"application/vnd.google-apps.vid": Video,
	"application/vnd.google-apps.video": Video,
	"application/vnd.google-gemini.gem": Sparkles,
};

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
				{recentFiles ? (
					<>
						<div>
							<div
								rel="noopener noreferrer"
								className="flex items-center gap-3 px-5 py-3 hover:bg-surface-high transition-colors group"
							>
								<span className="text-label text-text-muted flex-shrink-0 w-28 font-mono">
									Date Modified
								</span>
								<span className="w-3 h-3 flex-shrink-0" />
								<span className="text-sm text-text-secondary truncate flex-1 group-hover:text-text-primary transition-colors">
									Name
								</span>
								<span className="text-sm text-text-muted flex-shrink-0 text-right w-16">
									Size
								</span>
							</div>
						</div>
						{recentFiles.map((file) => (
							<RecentFileRow key={file.id} file={file} />
						))}
					</>
				) : (
					Array.from({ length: 8 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: As this is a static skeleton, using index as key is fine
						<div key={i} className="flex items-center gap-3 px-5 py-3 opacity-20">
							<div className="w-16 h-3 bg-surface-top" />
							<div className="w-3 h-3 bg-surface-top" />
							<div className="flex-1 h-3 bg-surface-top" />
							<div className="w-16 h-3 bg-surface-top" />
						</div>
					))
				)}
			</div>
		</div>
	);
}

function RecentFileRow({ file }: { file: RecentFileEntry }) {
	const date = new Date(file.modifiedTime);
	const formattedDate = date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	const Icon = MIME_ICONS[file.mimeType] ?? File;

	return (
		<a
			href={file.webViewLink}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-3 px-5 py-3 hover:bg-surface-high transition-colors group"
		>
			<span className="text-label text-text-muted flex-shrink-0 w-28 font-mono">
				{formattedDate}
			</span>
			<span className="w-3 h-3 flex-shrink-0">
				<Icon size={12} color={getMimeColor(file.mimeType)} />
			</span>
			<span className="text-sm text-text-secondary truncate flex-1 group-hover:text-text-primary transition-colors">
				{file.name}
			</span>
			<span className="text-sm text-text-muted flex-shrink-0 text-right w-16">
				{formatBytes(file.size)}
			</span>
		</a>
	);
}
