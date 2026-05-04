import { createRootRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useAuth } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

function useIsActive({ filter, to }: { filter?: string; to?: string }) {
	const state = useRouterState();
	if (to) return state.location.pathname === to;
	if (state.location.pathname !== "/results") return false;
	const params = new URLSearchParams(state.location.searchStr.replace(/^\?/, ""));
	return params.get("filter") === filter;
}

function useIsDashboard() {
	const state = useRouterState();
	return state.location.pathname === "/dashboard";
}

const NAV_ITEMS: Array<{ label: string; filter?: string; to?: string }> = [
	{ label: "DUPLICATES", filter: "duplicates" },
	{ label: "SAME FOLDER", to: "/same-folder" },
	{ label: "HIDDEN", filter: "hidden" },
	{ label: "EMPTY", filter: "empty" },
	{ label: "LARGE", filter: "large" },
	{ label: "OLD", filter: "old" },
	{ label: "NOT OWNED BY ME", filter: "not-owned" },
	{ label: "TYPE", filter: "type" },
	{ label: "ALL FILES", filter: "all-files" },
];

const sidebarLinkClass =
	"px-[18px] py-[5px] text-[9px] font-bold tracking-[0.12em] uppercase font-barlow-condensed cursor-pointer block no-underline text-[var(--theme-sidebar-text)]";

function NavItem({ label, filter, to }: { label: string; filter?: string; to?: string }) {
	const active = useIsActive({ filter, to });
	if (to) {
		return (
			<Link
				to={to as "/same-folder"}
				className={sidebarLinkClass}
				style={{
					fontWeight: active ? 700 : 500,
					color: active ? "var(--theme-sidebar-active)" : "var(--theme-sidebar-text)",
					background: active ? "var(--theme-sidebar-active-bg)" : "transparent",
				}}
			>
				{label}
			</Link>
		);
	}
	return (
		<Link
			to="/results"
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			search={{ filter } as any}
			className={sidebarLinkClass}
			style={{
				fontWeight: active ? 700 : 500,
				color: active ? "var(--theme-sidebar-active)" : "var(--theme-sidebar-text)",
				background: active ? "var(--theme-sidebar-active-bg)" : "transparent",
			}}
		>
			{label}
		</Link>
	);
}

function Sidebar() {
	const { clearAuth } = useAuth();
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const dashActive = useIsDashboard();

	const handleSignOut = () => {
		clearAuth();
		navigate({ to: "/" });
	};

	return (
		<aside className="w-[180px] shrink-0 bg-[var(--theme-sidebar-bg)] border-r border-[var(--theme-sidebar-border)] flex flex-col h-full font-barlow-condensed">
			{/* Logo */}
			<div className="px-[18px] pt-5 pb-4 border-b border-[var(--theme-sidebar-border)]">
				<div className="text-[18px] font-black text-[var(--theme-sidebar-accent)] leading-[1.1] uppercase">
					Drive
					<br />
					Duplicate
					<br />
					Cleaner
				</div>
				<div className="text-[8px] font-bold text-[var(--theme-sidebar-text)] tracking-[0.1em] mt-1">
					DRIVE SCANNER V1
				</div>
			</div>

			{/* Storage summary */}
			<div className="py-2 border-b border-[var(--theme-sidebar-border)]">
				<Link
					to="/dashboard"
					className={sidebarLinkClass}
					style={{
						color: dashActive
							? "var(--theme-sidebar-active)"
							: "var(--theme-sidebar-text)",
						background: dashActive ? "var(--theme-sidebar-active-bg)" : "transparent",
					}}
				>
					STORAGE SUMMARY
				</Link>
			</div>

			{/* Files by category */}
			<div className="py-2 border-b border-[var(--theme-sidebar-border)]">
				<div className="px-[18px] pt-1 pb-2 text-[8px] font-bold text-[var(--theme-sidebar-text)] tracking-[0.12em] uppercase">
					FILES BY CATEGORY
				</div>
				{NAV_ITEMS.map((item) => (
					<NavItem
						key={item.filter}
						label={item.label}
						filter={item.filter}
						to={item.to}
					/>
				))}
			</div>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Footer links */}
			<div className="border-t border-[var(--theme-sidebar-border)] py-3">
				<Link to="/dashboard" className={sidebarLinkClass}>
					STORAGE ANALYZER
				</Link>
				<Link
					to="/results"
					search={{ filter: "duplicates" } as never}
					className={sidebarLinkClass}
				>
					BROWSE GROUPS
				</Link>
				<button
					type="button"
					onClick={toggleTheme}
					className={`${sidebarLinkClass} border-none bg-transparent w-full text-left`}
				>
					{theme === "light" ? "◑ DARK MODE" : "◐ LIGHT MODE"}
				</button>
			</div>

			{/* Log out */}
			<div className="border-t border-[var(--theme-sidebar-border)] py-3">
				<button
					type="button"
					onClick={handleSignOut}
					className={`${sidebarLinkClass} border-none bg-transparent w-full text-left`}
				>
					LOG OUT
				</button>
			</div>
		</aside>
	);
}

function RootComponent() {
	useGoogleAuth();
	const { isAuthenticated, isAuthLoading } = useAuth();
	const { theme } = useTheme();

	if (isAuthLoading) {
		return (
			<div className="min-h-screen bg-ink flex items-center justify-center">
				<span className="text-text-muted text-label uppercase tracking-widest animate-pulse">
					INITIALIZING...
				</span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Outlet />;
	}

	return (
		<div data-theme={theme} className="flex h-screen overflow-hidden">
			<Sidebar />
			<main className="flex-1 overflow-y-auto bg-surface">
				<Outlet />
			</main>
		</div>
	);
}

function AppRoot() {
	return (
		<ThemeProvider>
			<RootComponent />
		</ThemeProvider>
	);
}

export const Route = createRootRoute({
	component: AppRoot,
	errorComponent: ({ error, reset }) => <ErrorBoundary error={error} reset={reset} />,
});
