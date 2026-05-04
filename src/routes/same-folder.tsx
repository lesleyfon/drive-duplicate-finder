import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/same-folder")({
	component: SameFolderPage,
});

function SameFolderPage() {
	return (
		<div className="flex flex-col h-full">
			<div className="px-8 py-5 border-b border-[var(--theme-topbar-border)]">
				<p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--theme-text-secondary)] mb-1">
					FILES BY CATEGORY / <span className="text-[var(--theme-accent)]">SAME FOLDER</span>
				</p>
				<h1 className="text-lg font-bold uppercase tracking-widest text-[var(--theme-text-primary)] font-barlow-condensed">
					SAME FOLDER DUPLICATES
				</h1>
			</div>
			<div className="flex-1 flex flex-col items-center justify-center gap-3 p-16">
				<p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--theme-text-secondary)]">
					FEATURE STATUS: <span className="text-[var(--theme-accent)]">COMING SOON</span>
				</p>
				<p className="text-sm text-[var(--theme-text-secondary)]">
					This feature is not yet implemented.
				</p>
			</div>
		</div>
	);
}
