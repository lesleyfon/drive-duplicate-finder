interface ScanProgressProps {
	totalFiles: number;
	isComplete: boolean;
	isFetching: boolean;
}

export function ScanProgress({ totalFiles, isComplete, isFetching }: ScanProgressProps) {
	return (
		<div className="flex flex-col items-center gap-6">
			<h2 className="text-md uppercase tracking-widest text-text-primary">
				{isComplete ? "SCAN COMPLETE" : "SCAN IN PROGRESS"}
			</h2>

			<div className="w-full h-1 bg-surface-high border border-border-dim overflow-hidden relative">
				{isComplete ? (
					<div className="h-full bg-cyan-bright w-full" />
				) : (
					<div className="absolute inset-y-0 bg-cyan-bright w-1/3 animate-indeterminate" />
				)}
			</div>

			<p className="text-sm text-text-muted uppercase tracking-widest">
				{isComplete ? (
					<>
						OBJECTS PARSED:{" "}
						<span className="text-status-ok">{totalFiles.toLocaleString()}</span>
					</>
				) : isFetching ? (
					<>
						OBJECTS PARSED:{" "}
						<span className="text-text-primary">{totalFiles.toLocaleString()}</span>
					</>
				) : (
					"INITIALIZING..."
				)}
			</p>
		</div>
	);
}
