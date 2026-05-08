import { createRouter } from "@tanstack/react-router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
	routeTree,
	defaultErrorComponent: ErrorBoundary,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
