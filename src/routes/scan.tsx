import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { NavBar } from "../components/NavBar";
import { ScanProgress } from "../components/ScanProgress";
import { useScanFiles } from "../hooks/useScanFiles";

export const Route = createFileRoute("/scan")({
	component: ScanPage,
});

function ScanPage() {
	const navigate = useNavigate();
	const { totalFiles, isComplete, isFetching, isFetchingNextPage, isError, error } =
		useScanFiles(true);

	useEffect(() => {
		if (isComplete) {
			// Brief pause so user can see "Scan complete" before redirect
			const t = setTimeout(() => navigate({ to: "/results" }), 800);
			return () => clearTimeout(t);
		}
	}, [isComplete, navigate]);

	return (
		<div className="min-h-screen bg-gray-50">
			<NavBar />
			<main className="max-w-xl mx-auto px-6 py-16 space-y-8">
				<div className="text-center space-y-1">
					<h1 className="text-2xl font-bold text-gray-900">Scanning your Drive</h1>
					<p className="text-gray-500 text-sm">This may take a minute for large drives</p>
				</div>

				<div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
					<ScanProgress
						totalFiles={totalFiles}
						isComplete={isComplete}
						isFetching={isFetching || isFetchingNextPage}
					/>

					{isError && (
						<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
							<p className="font-medium">Scan interrupted</p>
							<p>{(error as Error)?.message ?? "Unknown error. Please retry."}</p>
						</div>
					)}

					<button
						type="button"
						onClick={() => navigate({ to: "/dashboard" })}
						className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Cancel scan
					</button>
				</div>
			</main>
		</div>
	);
}
