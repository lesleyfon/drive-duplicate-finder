import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./router";
import "./index.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				const status = (error as { status?: number }).status;
				// Don't retry on auth errors or not found
				if (status === 401 || status === 403 || status === 404) return false;
				// Retry up to 3 times on network/rate-limit errors
				return failureCount < 3;
			},
			retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
		},
	},
});

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>,
);
