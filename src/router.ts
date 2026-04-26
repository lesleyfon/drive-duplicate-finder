import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const router = createRouter({
	routeTree,
	defaultErrorComponent: ErrorBoundary,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
