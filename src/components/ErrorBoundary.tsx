import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
	error: Error;
	reset: () => void;
}

const MAX_RETRIES = 2;

// Persists across remounts so retry count survives TanStack Router re-rendering the error component
let retryCount = 0;

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
	const navigate = useNavigate();
	const retriesExhausted = retryCount >= MAX_RETRIES;

	const handleRetry = () => {
		retryCount++;
		reset();
	};

	const handleGoHome = () => {
		retryCount = 0;
		navigate({ to: "/" });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
			<div className="w-full max-w-md space-y-6 text-center">
				<div className="flex justify-center">
					<div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
						<AlertTriangle className="w-9 h-9 text-red-500" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
					{retriesExhausted ? (
						<p className="text-gray-500">
							The error persists after multiple retries. Please go back to the home
							page.
						</p>
					) : (
						<p className="text-gray-500">
							An unexpected error occurred. You can try again or go back to the home
							page.
						</p>
					)}
				</div>

				<div className="bg-white border border-red-100 rounded-xl p-4 text-left">
					<p className="text-xs font-mono text-red-600 break-all">{error.message}</p>
				</div>

				{retriesExhausted ? (
					<button
						type="button"
						onClick={handleGoHome}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
					>
						<Home className="w-4 h-4" />
						Go to Home
					</button>
				) : (
					<div className="flex gap-3">
						<button
							type="button"
							onClick={handleRetry}
							className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
						>
							<RefreshCw className="w-4 h-4" />
							Retry
							<span className="text-red-200 text-sm font-normal">
								({MAX_RETRIES - retryCount} left)
							</span>
						</button>
						<button
							type="button"
							onClick={handleGoHome}
							className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow border border-gray-200 transition-colors flex items-center justify-center gap-2"
						>
							<Home className="w-4 h-4" />
							Go Home
						</button>
					</div>
				)}

				{!retriesExhausted && (
					<p className="text-xs text-gray-400">
						Retry {retryCount} of {MAX_RETRIES}
					</p>
				)}
			</div>
		</div>
	);
}
