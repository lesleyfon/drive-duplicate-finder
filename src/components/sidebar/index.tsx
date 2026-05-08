import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NavItem, sidebarLinkClass, type NavigationPath } from "./SidebarItem";

function useIsDashboard() {
	const state = useRouterState();
	return state.location.pathname === "/dashboard";
}

const NAV_ITEMS: Array<{ label: string; filter?: string; to?: NavigationPath }> = [
	{ label: "Duplicates", filter: "duplicates" },
	{ label: "Same Folder", to: "/same-folder" },
	{ label: "Large Files", to: "/large-files" },
	{ label: "Old Files", to: "/old-files" },
	{ label: "Recently Deleted", to: "/trash" },
	// { label: "All Files", filter: "all-files" },
	// { label: "Browse by File Groups", filter: "Browse by File Groups" },
];

export default function Sidebar() {
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
						key={item.label}
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
