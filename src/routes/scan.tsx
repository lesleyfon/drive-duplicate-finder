import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ScanProgress } from "../components/ScanProgress";
import { useScanFiles } from "../hooks/useScanFiles";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export const Route = createFileRoute("/scan")({
	component: ScanPage,
});

function ScanPage() {
	const navigate = useNavigate();
	const { totalFiles, isComplete, isFetching, isFetchingNextPage, isError, error } =
		useScanFiles(true);
	const { signOut } = useGoogleAuth();

	useEffect(() => {
		if (isComplete) {
			const t = setTimeout(
				() => navigate({ to: "/results", search: { filter: "duplicates" } }),
				800,
			);
			return () => clearTimeout(t);
		}
	}, [isComplete, navigate]);

	useEffect(() => {
		if (isError && "status" in error && error.status === 401) {
			signOut();
			navigate({ to: "/" });
		}
	}, [isError, error, signOut, navigate]);
	return (
		<div className="flex flex-col h-full">
			{/* Page header */}
			<div className="px-8 py-5 border-b border-border-dim">
				<p className="text-label uppercase tracking-widest text-text-muted mb-1">
					CLEANUP / <span className="text-cyan-bright">SCAN</span>
				</p>
				<h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
					DRIVE SCAN
				</h1>
			</div>

			{/* Scan progress */}
			<div className="flex-1 flex flex-col items-center justify-center p-12 gap-6 w-full max-w-xl mx-auto">
				<ScanProgress
					totalFiles={totalFiles}
					isComplete={isComplete}
					isFetching={isFetching || isFetchingNextPage}
				/>

				{isError && (
					<div className="w-full border border-status-error bg-surface-low p-4">
						<p className="text-label uppercase tracking-widest text-status-error mb-1">
							SCAN INTERRUPTED
						</p>
						<p className="text-sm text-text-secondary">
							{(error as Error)?.message ?? "Unknown error. Please retry."}
						</p>
					</div>
				)}

				<button
					type="button"
					onClick={() => navigate({ to: "/dashboard" })}
					className="px-6 py-2 border border-border-bright text-text-secondary text-label uppercase tracking-widest hover:border-text-primary hover:text-text-primary transition-colors"
				>
					CANCEL
				</button>
			</div>
		</div>
	);
}
