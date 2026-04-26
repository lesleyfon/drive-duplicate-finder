import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Files, LogOut, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SidebarItem } from "../components/SidebarItem";
import { ErrorBoundary } from "../components/ErrorBoundary";

function Sidebar() {
	const { clearAuth } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = () => {
		clearAuth();
		navigate({ to: "/" });
	};

	return (
		<aside className="w-[260px] flex-shrink-0 bg-surface-dim border-r border-border-dim flex flex-col h-screen sticky top-0">
			{/* Logo */}
			<div className="px-6 py-5 border-b border-border-dim">
				<span className="text-cyan-bright text-lg font-bold uppercase tracking-widest block">
					Drive Duplicate Cleaner
				</span>
				<p className="text-text-muted text-label uppercase mt-1 tracking-widest">
					DRIVE SCANNER V1
				</p>
			</div>

			{/* Nav */}
			<nav className="flex-1 overflow-y-auto py-4">
				<SidebarItem
					icon={<LayoutDashboard size={14} />}
					label="STORAGE SUMMARY"
					to="/dashboard"
					level={1}
				/>

				{/* Files by category */}
				<div className="px-6 pt-5 pb-2">
					<p className="text-label uppercase tracking-widest text-text-muted">
						FILES BY CATEGORY
					</p>
				</div>
				<SidebarItem
					label="DUPLICATES"
					to="/results"
					search={{ filter: "duplicates" }}
					level={2}
				/>
				<SidebarItem
					label="SAME FOLDER"
					to="/results"
					search={{ filter: "same-folder" }}
					level={2}
				/>
				<SidebarItem label="HIDDEN" to="/results" search={{ filter: "hidden" }} level={2} />
				<SidebarItem label="EMPTY" to="/results" search={{ filter: "empty" }} level={2} />
				<SidebarItem label="LARGE" to="/results" search={{ filter: "large" }} level={2} />
				<SidebarItem label="OLD" to="/results" search={{ filter: "old" }} level={2} />
				<SidebarItem
					label="NOT OWNED BY ME"
					to="/results"
					search={{ filter: "not-owned" }}
					level={2}
				/>
				<SidebarItem label="TYPE" to="/results" search={{ filter: "type" }} level={2} />
				<SidebarItem
					label="ALL FILES"
					to="/results"
					search={{ filter: "all-files" }}
					level={2}
				/>

				{/* Folders by category — future */}
				<div className="px-6 pt-5 pb-2">
					<p className="text-label uppercase tracking-widest text-text-muted opacity-40">
						FOLDERS BY CATEGORY
					</p>
				</div>

				<div className="pt-3">
					<SidebarItem
						icon={<Layers size={14} />}
						label="STORAGE ANALYZER"
						to="/dashboard"
						level={1}
					/>
					<SidebarItem
						icon={<Files size={14} />}
						label="BROWSE GROUPS"
						to="/results"
						search={{ filter: "duplicates" }}
						level={1}
					/>
				</div>
			</nav>

			{/* Bottom */}
			<div className="border-t border-border-dim py-4">
				<SidebarItem
					icon={<LogOut size={14} />}
					label="LOG OUT"
					onClick={handleSignOut}
					level={1}
				/>
			</div>
		</aside>
	);
}

function RootComponent() {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Outlet />;
	}

	return (
		<div className="flex h-screen bg-surface overflow-hidden">
			<Sidebar />
			<main className="flex-1 overflow-y-auto bg-surface">
				<Outlet />
			</main>
		</div>
	);
}

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: ({ error, reset }) => <ErrorBoundary error={error} reset={reset} />,
});
