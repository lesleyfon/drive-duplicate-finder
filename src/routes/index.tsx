import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { HardDrive, Shield, Trash2, Search } from "lucide-react";
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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
			<div className="w-full max-w-md space-y-8">
				{/* Logo & title */}
				<div className="text-center space-y-3">
					<div className="flex justify-center">
						<div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
							<HardDrive className="w-9 h-9 text-white" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Drive Duplicate Finder</h1>
					<p className="text-gray-500 text-lg">
						Find and remove duplicate files from your Google Drive
					</p>
				</div>

				{/* Features */}
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
					<div className="flex items-start gap-3">
						<Search className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
						<div>
							<p className="font-medium text-gray-800 text-sm">Unlimited scans</p>
							<p className="text-gray-500 text-sm">
								Scan your entire Drive with no file limit.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
						<div>
							<p className="font-medium text-gray-800 text-sm">Safe deletion</p>
							<p className="text-gray-500 text-sm">
								Files are moved to Trash — never permanently deleted. Restore within
								30 days.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<Trash2 className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
						<div>
							<p className="font-medium text-gray-800 text-sm">
								Runs in your browser
							</p>
							<p className="text-gray-500 text-sm">
								No backend server. Your data never leaves your browser.
							</p>
						</div>
					</div>
				</div>

				{/* Permissions note */}
				<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
					<p className="font-medium mb-1">Permissions requested:</p>
					<ul className="list-disc list-inside space-y-0.5 text-blue-600">
						<li>Read file metadata (names, sizes, checksums)</li>
						<li>Read file content (for deep comparison)</li>
						<li>Move files to Trash</li>
					</ul>
				</div>

				{/* Sign in button */}
				<button
					type="button"
					onClick={signIn}
					className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow transition-colors flex items-center justify-center gap-3"
				>
					<GoogleIcon />
					Sign in with Google
				</button>

				{/* Unverified app warning */}
				<p className="text-xs text-gray-400 text-center leading-relaxed">
					Google may show an &ldquo;unverified app&rdquo; warning. Click{" "}
					<strong>Advanced → Go to Drive Duplicate Finder (unsafe)</strong> to continue.
					This is expected for personal apps that haven&apos;t gone through Google&apos;s
					verification process.
				</p>
			</div>
		</div>
	);
}

function GoogleIcon() {
	return (
		<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
			<title>Google</title>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}
