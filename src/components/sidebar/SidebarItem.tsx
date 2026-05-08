import { Link, useRouterState } from "@tanstack/react-router";

function useIsActive({ filter, to }: { filter?: string; to?: string }) {
	const state = useRouterState();
	if (to) return state.location.pathname === to;
	if (state.location.pathname !== "/results") return false;
	const params = new URLSearchParams(state.location.searchStr.replace(/^\?/, ""));
	return params.get("filter") === filter;
}

export type NavigationPath = "/same-folder" | "/large-files" | "/old-files" | "/trash";

export const sidebarLinkClass =
	"px-[18px] py-[5px] text-[9px] font-bold tracking-[0.12em] uppercase font-barlow-condensed cursor-pointer block no-underline text-[var(--theme-sidebar-text)]";

export function NavItem({
	label,
	filter,
	to,
}: {
	label: string;
	filter?: string;
	to?: NavigationPath;
}) {
	const active = useIsActive({ filter, to });
	if (to) {
		return (
			<Link
				to={to}
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
			search={{ filter } as unknown as { [key: string]: string }}
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
