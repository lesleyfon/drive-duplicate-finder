import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/")({
	component: LoginPage,
});

function LoginPage() {
	const { signIn } = useGoogleAuth();
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="min-h-screen bg-ink flex items-center justify-center">
			<div className="border border-border-dim bg-surface p-10 w-full max-w-sm">
				{/* Logo */}
				<div className="mb-8">
					<h1 className="text-lg font-bold uppercase tracking-widest text-cyan-bright">
						CLEANUP
					</h1>
					<p className="text-label uppercase tracking-widest text-text-muted mt-1">
						DRIVE_SCANNER_V1
					</p>
				</div>

				<p className="text-sm text-text-secondary mb-8 leading-relaxed">
					Find and remove duplicate files from your Google Drive. No backend required.
				</p>

				<button
					type="button"
					onClick={signIn}
					className="w-full py-3 bg-cyan-bright text-ink font-semibold text-label uppercase tracking-widest hover:bg-cyan-dim transition-colors flex items-center justify-center gap-2"
				>
					AUTHENTICATE_GOOGLE
				</button>

				<p className="text-sm text-text-muted mt-5 leading-relaxed">
					You may see an &ldquo;unverified app&rdquo; warning from Google. Click{" "}
					<strong className="text-text-secondary">Advanced → Continue</strong> to proceed.
				</p>
			</div>
		</div>
	);
}
