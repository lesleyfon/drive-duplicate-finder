import { useNavigate } from "@tanstack/react-router";

export function NoResult({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	const navigate = useNavigate();
	return (
		<div className="flex flex-col h-full bg-[var(--theme-page-bg)]">
			<div className="h-14 px-8 flex items-center gap-2 bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-topbar-border)]">
				<span className="text-[13px] font-semibold text-[var(--theme-text-primary)] tracking-[0.05em] uppercase font-barlow">
					{title}
				</span>
			</div>
			<div className="flex-1 flex flex-col items-center justify-center gap-4">
				<p className="text-[11px] font-bold text-[var(--theme-text-secondary)] tracking-[0.08em] uppercase font-barlow">
					{description}
				</p>
				<button
					type="button"
					onClick={() => navigate({ to: "/dashboard" })}
					className="px-5 py-2 rounded bg-[var(--theme-accent)] text-white text-[12px] font-bold tracking-[0.06em] uppercase font-barlow border-none cursor-pointer"
				>
					Back to Dashboard
				</button>
			</div>
		</div>
	);
}
