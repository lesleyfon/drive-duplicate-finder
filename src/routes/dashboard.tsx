import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScanLine } from "lucide-react";
import { NavBar } from "../components/NavBar";
import { StorageBar } from "../components/StorageBar";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const handleStartScan = () => {
		// Clear previous scan data
		queryClient.removeQueries({ queryKey: ["scanFiles"] });
		queryClient.removeQueries({ queryKey: ["scanResults"] });
		navigate({ to: "/scan" });
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<NavBar />
			<main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-500 mt-1">
						Scan your Google Drive to find and remove duplicate files.
					</p>
				</div>

				<StorageBar />

				<div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-5">
					<div className="flex justify-center">
						<div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
							<ScanLine className="w-7 h-7 text-blue-600" />
						</div>
					</div>
					<div>
						<h2 className="text-xl font-semibold text-gray-900">Start a Scan</h2>
						<p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
							We&apos;ll fetch all your Drive files and group duplicates by checksum,
							size, and name. Large drives (10k+ files) may take a minute or two.
						</p>
					</div>
					<button
						type="button"
						onClick={handleStartScan}
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-sm transition-colors"
					>
						Start Scan
					</button>
				</div>
			</main>
		</div>
	);
}
