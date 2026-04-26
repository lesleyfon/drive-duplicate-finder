import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface SidebarItemProps {
	icon?: ReactNode;
	label: string;
	to?: string;
	search?: Record<string, string>;
	onClick?: () => void;
	level?: 1 | 2;
	disabled?: boolean;
}

function useIsActiveLink(to?: string, search?: Record<string, string>) {
	const state = useRouterState();
	if (!to || state.location.pathname !== to) return false;
	if (!search) return true;
	const params = new URLSearchParams(state.location.searchStr.replace(/^\?/, ""));
	return Object.entries(search).every(([k, v]) => params.get(k) === v);
}

export function SidebarItem({
	icon,
	label,
	to,
	search,
	onClick,
	level = 1,
	disabled = false,
}: SidebarItemProps) {
	const isActive = useIsActiveLink(to, search);

	const baseClass =
		level === 1
			? "flex items-center gap-3 px-6 py-2 text-nav uppercase tracking-widest border-l-4 w-full transition-colors"
			: "flex items-center gap-2 py-1.5 text-nav-2 transition-colors pl-[38px] border-l border-border-dim ml-6 w-full";

	const colorClass = isActive
		? level === 1
			? "border-cyan-bright text-text-primary bg-[#111111]"
			: "text-text-primary"
		: level === 1
			? "border-transparent text-text-secondary hover:bg-[#111111] hover:text-text-primary"
			: "text-text-secondary hover:text-text-primary";

	const className = `${baseClass} ${colorClass}`;

	if (disabled) {
		return (
			<div
				className={`${baseClass} text-text-muted opacity-40 cursor-not-allowed ${level === 1 ? "border-transparent" : ""}`}
			>
				{icon && <span className="flex-shrink-0">{icon}</span>}
				<span>{label}</span>
			</div>
		);
	}

	if (onClick) {
		return (
			<button type="button" onClick={onClick} className={className}>
				{icon && <span className="flex-shrink-0">{icon}</span>}
				<span>{label}</span>
			</button>
		);
	}

	return (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		<Link to={to as any} search={search as any} className={className}>
			{icon && <span className="flex-shrink-0">{icon}</span>}
			<span>{label}</span>
		</Link>
	);
}
