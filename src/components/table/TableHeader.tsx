import { cn } from "../../lib/cn";
import type { TableHeaderLabelsType } from "./types";
export function TableHeader({
	allVisibleSelected,
	toggleSelectAll,
	tableHeaderLabels,
	colTemplate,
}: {
	allVisibleSelected: boolean;
	toggleSelectAll: () => void;
	tableHeaderLabels: TableHeaderLabelsType;
	colTemplate: string;
}) {
	return (
		<div
			className={cn(
				"grid items-center px-5 py-[10px] border border-[var(--theme-card-border)] bg-[var(--theme-expanded-bg)] rounded-t-[10px] shrink-0 w-full",
			)}
			style={{ gridTemplateColumns: colTemplate }}
		>
			{/* ── Table header ── */}
			<div>
				<input
					type="checkbox"
					checked={allVisibleSelected}
					onChange={toggleSelectAll}
					aria-label="Select all visible files"
				/>
			</div>
			{tableHeaderLabels.map((label) => (
				<span
					key={label}
					className="text-[9px] font-bold tracking-[0.08em] uppercase text-[var(--theme-date-text)]"
				>
					{label}
				</span>
			))}
		</div>
	);
}
