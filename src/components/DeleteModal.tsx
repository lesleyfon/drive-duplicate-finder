import { X } from "lucide-react";
import { formatBytes } from "../lib/formatters";
import type { FileRecord } from "../types/drive";

interface DeleteModalProps {
	files: FileRecord[];
	totalBytes: number;
	onConfirm: () => void;
	onCancel: () => void;
	isPending: boolean;
}

export function DeleteModal({
	files,
	totalBytes,
	onConfirm,
	onCancel,
	isPending,
}: DeleteModalProps) {
	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div className="bg-surface border border-border-mid w-full max-w-lg flex flex-col max-h-[80vh]">
				{/* Header */}
				<div className="px-6 py-4 border-b border-border-dim flex items-center justify-between flex-shrink-0">
					<h2 className="text-nav uppercase tracking-widest text-text-primary">
						CONFIRM_DELETE
					</h2>
					<button
						type="button"
						onClick={onCancel}
						className="text-text-muted hover:text-cyan-bright transition-colors"
					>
						<X size={16} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
					<p className="text-sm text-status-warn uppercase tracking-widest">
						⚠ FILES WILL BE MOVED TO TRASH — RECOVERABLE WITHIN 30 DAYS
					</p>

					<div className="border border-border-dim max-h-48 overflow-y-auto">
						{files.map((f) => (
							<div
								key={f.id}
								className="flex items-center justify-between px-4 py-2 border-b border-border-dim last:border-0"
							>
								<span className="text-sm text-text-secondary truncate">
									{f.name}
								</span>
								<span className="text-label text-text-muted flex-shrink-0 ml-4">
									{formatBytes(f.size)}
								</span>
							</div>
						))}
					</div>

					<p className="text-label uppercase tracking-widest text-text-muted">
						SPACE_TO_FREE:{" "}
						<span className="text-text-primary">{formatBytes(totalBytes)}</span>
					</p>
				</div>

				{/* Actions */}
				<div className="px-6 py-4 border-t border-border-dim flex gap-3 justify-end flex-shrink-0">
					<button
						type="button"
						onClick={onCancel}
						disabled={isPending}
						className="px-5 py-2 border border-text-secondary text-text-secondary text-label uppercase tracking-widest hover:border-text-primary hover:text-text-primary transition-colors disabled:opacity-50"
					>
						CANCEL
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isPending}
						className="px-5 py-2 bg-cyan-bright text-ink text-label uppercase tracking-widest font-semibold hover:bg-cyan-dim transition-colors disabled:opacity-50 flex items-center gap-2"
					>
						{isPending ? (
							<>
								<span className="w-3 h-3 border border-ink/30 border-t-ink animate-spin inline-block" />
								EXECUTING...
							</>
						) : (
							"EXECUTE WIPE"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
