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
	type LucideIcon,
	Mail,
	Map as MapIcon,
	Music,
	Presentation,
	Sparkles,
	Table,
	Video,
} from "lucide-react";
import { formatBytes, getMimeColor } from "../lib/formatters";
import type { RecentFileEntry, ScanResult } from "../types/drive";

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
	"application/vnd.google.gemini.gem": Sparkles,
};

interface Props {
	scanResults: ScanResult | null;
}

export function RecentFileActivity({ scanResults }: Props) {
	const recentFiles = scanResults?.recentFiles ?? null;

	return (
		<div className="rounded-xl overflow-hidden flex flex-col bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] shadow-[var(--theme-card-shadow)]">
			{/* Panel header */}
			<div className="flex items-center justify-between py-4 px-5 border-b border-b-[var(--theme-card-border)]">
				<h2 className="font-barlow-condensed font-black uppercase tracking-[0.1em] text-[11px] text-[var(--theme-text-primary)]">
					RECENT FILE ACTIVITY
				</h2>
				<span
					className="font-barlow-condensed uppercase rounded py-1 px-[10px] text-[10px] font-extrabold tracking-[0.12em] text-[var(--theme-accent)]"
					style={{
						background:
							"color-mix(in srgb, var(--theme-accent) 10%, transparent)",
						border:
							"1px solid color-mix(in srgb, var(--theme-accent) 27%, transparent)",
					}}
				>
					Storage Size
				</span>
			</div>

			{/* Table header */}
			<div className="grid grid-cols-[120px_1fr_80px] py-2 px-5 bg-[var(--theme-page-bg)]">
				{(["DATE MODIFIED", "NAME", "SIZE"] as const).map((col, i) => (
					<span
						key={col}
						className={`text-[9px] font-bold uppercase tracking-[0.12em] font-barlow-condensed text-[var(--theme-text-dim)] ${i === 2 ? "text-right" : "text-left"}`}
					>
						{col}
					</span>
				))}
			</div>

			{/* File rows */}
			<div className="flex flex-col">
				{recentFiles
					? recentFiles.map((file) => (
							<RecentFileRow key={file.id} file={file} />
						))
					: Array.from({ length: 8 }).map((_, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows, not dynamic list
								key={i}
								className="grid items-center opacity-20 grid-cols-[120px_1fr_80px] py-[10px] px-5 border-b border-b-[var(--theme-file-row-border)]"
							>
								<div className="h-3 rounded bg-[var(--theme-border)] w-[70px]" />
								<div className="h-3 rounded bg-[var(--theme-border)] w-[80%]" />
								<div className="h-3 rounded ml-auto bg-[var(--theme-border)] w-[50px]" />
							</div>
						))}
			</div>
		</div>
	);
}

function RecentFileRow({ file }: { file: RecentFileEntry }) {
	const formattedDate = new Date(file.modifiedTime).toLocaleDateString(
		undefined,
		{
			year: "numeric",
			month: "short",
			day: "numeric",
		},
	);
	const Icon = MIME_ICONS[file.mimeType] ?? File;

	return (
		<a
			href={file.webViewLink}
			target="_blank"
			rel="noopener noreferrer"
			className="row-hover grid items-center transition-colors cursor-pointer no-underline grid-cols-[120px_1fr_80px] py-[10px] px-5 border-b border-b-[var(--theme-file-row-border)]"
		>
			<span className="text-[11px] font-jetbrains text-[var(--theme-text-secondary)]">
				{formattedDate}
			</span>
			<span className="flex items-center gap-2 min-w-0">
				<Icon
					size={13}
					color={getMimeColor(file.mimeType)}
					className="shrink-0"
				/>
				<span className="text-[12px] truncate text-[var(--theme-body-text)]">
					{file.name}
				</span>
			</span>
			<span className="text-[11px] font-jetbrains text-right text-[var(--theme-text-secondary)]">
				{formatBytes(file.size)}
			</span>
		</a>
	);
}
