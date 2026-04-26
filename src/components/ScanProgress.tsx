interface ScanProgressProps {
	totalFiles: number;
	isComplete: boolean;
	isFetching: boolean;
}

export function ScanProgress({ totalFiles, isComplete, isFetching }: ScanProgressProps) {
	return (
		<div className="space-y-3">
			{/* Progress bar */}
			<div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
				{isComplete ? (
					<div className="h-3 bg-green-500 rounded-full w-full transition-all" />
				) : (
					<div className="h-3 rounded-full bg-blue-500 animate-[indeterminate_1.5s_ease-in-out_infinite]" />
				)}
			</div>

			{/* Status */}
			<p className="text-sm text-gray-600">
				{isComplete ? (
					<span className="text-green-700 font-medium">
						Scan complete — {totalFiles.toLocaleString()} files found
					</span>
				) : isFetching ? (
					<>
						Scanning&hellip;{" "}
						<span className="font-medium">
							{totalFiles.toLocaleString()} files found so far
						</span>
					</>
				) : (
					"Starting scan…"
				)}
			</p>
		</div>
	);
}
