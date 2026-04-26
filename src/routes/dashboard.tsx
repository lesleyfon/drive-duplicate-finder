import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ScanLine } from "lucide-react";
import { StorageBar } from "../components/StorageBar";

export const Route = createFileRoute("/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const handleStartScan = () => {
		queryClient.removeQueries({ queryKey: ["scanFiles"] });
		queryClient.removeQueries({ queryKey: ["scanResults"] });
		navigate({ to: "/scan" });
	};

	return (
		<div className="flex flex-col h-full">
			{/* Page header */}
			<div className="px-8 py-5 border-b border-border-dim">
				<p className="text-label uppercase tracking-widest text-text-muted mb-1">
					CLEANUP / <span className="text-cyan-bright">STORAGE SUMMARY</span>
				</p>
				<h1 className="text-lg font-bold uppercase tracking-widest text-text-primary">
					STORAGE SUMMARY
				</h1>
			</div>

			{/* Storage bar */}
			<StorageBar />

			{/* Scan launcher */}
			<div className="flex-1 flex flex-col items-center justify-center p-12 gap-6">
				<div className="border border-border-dim bg-surface-low p-8 w-full max-w-md text-center space-y-5">
					<div className="flex justify-center">
						<div className="w-12 h-12 bg-surface-high border border-border-dim flex items-center justify-center">
							<ScanLine className="w-6 h-6 text-cyan-bright" />
						</div>
					</div>

					<div>
						<h2 className="text-nav uppercase tracking-widest text-text-primary mb-2">
							INITIATE SCAN
						</h2>
						<p className="text-sm text-text-muted leading-relaxed">
							Fetch all Drive files and group duplicates by checksum, size, and name.
							Large drives (10k+ files) may take a minute or two.
						</p>
					</div>

					<button
						type="button"
						onClick={handleStartScan}
						className="w-full py-3 bg-cyan-bright text-ink font-semibold text-label uppercase tracking-widest hover:bg-cyan-dim transition-colors"
					>
						START SCAN
					</button>
				</div>
			</div>
		</div>
	);
}
