import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ErrorBoundary } from "../components/ErrorBoundary";

export const Route = createRootRoute({
	component: () => <Outlet />,
	errorComponent: ({ error, reset }) => <ErrorBoundary error={error} reset={reset} />,
});
