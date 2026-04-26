import { AlertTriangle, X } from "lucide-react";
import type { FileRecord } from "../types/drive";
import { formatBytes } from "../lib/formatters";

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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<button type="button" className="absolute inset-0 bg-black/50" onClick={onCancel} />

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
				<div className="flex items-center justify-between p-5 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
					<button
						type="button"
						onClick={onCancel}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* File list */}
				<div className="overflow-y-auto flex-1 p-5 space-y-1.5">
					{files.map((file) => (
						<div
							key={file.id}
							className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0"
						>
							<span className="text-gray-700 truncate">{file.name}</span>
							<span className="text-gray-400 text-xs flex-shrink-0">
								{formatBytes(file.size)}
							</span>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="p-5 border-t border-gray-200 space-y-3">
					<div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
						<AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
						<span>
							Files will be moved to Trash. You can restore them from Google Drive
							Trash within 30 days.
						</span>
					</div>

					<div className="flex items-center justify-between text-sm font-medium text-gray-700">
						<span>Space to be freed</span>
						<span className="text-green-700">{formatBytes(totalBytes)}</span>
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onCancel}
							disabled={isPending}
							className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isPending}
							className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
						>
							{isPending ? (
								<>
									<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Deleting…
								</>
							) : (
								`Delete ${files.length} file${files.length !== 1 ? "s" : ""}`
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
