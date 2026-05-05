import type { ReactNode } from "react";
import type { FileRecord } from "../../types/drive";
import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";
import type { TableHeaderLabelsType } from "./types";

export const Table = ({
	files,
	visibleFiles,
	selected,
	allVisibleSelected,
	toggleSelect,
	toggleSelectAll,
	tableHeaderLabels,
	colTemplate,
	renderMetricCols,
	emptyTitle,
	emptyDescription,
}: {
	files: FileRecord[];
	visibleFiles: FileRecord[];
	selected: Set<string>;
	allVisibleSelected: boolean;
	toggleSelect: (id: string) => void;
	toggleSelectAll: () => void;
	tableHeaderLabels: TableHeaderLabelsType;
	colTemplate: string;
	renderMetricCols: (file: FileRecord, typeStyle: { bg: string; text: string }) => ReactNode;
	emptyTitle: string;
	emptyDescription: string;
}) => {
	return (
		<div className="px-8 py-4 flex flex-col items-center justify-between overflow-auto">
			<TableHeader
				allVisibleSelected={allVisibleSelected}
				toggleSelectAll={toggleSelectAll}
				tableHeaderLabels={tableHeaderLabels}
				colTemplate={colTemplate}
			/>

			<TableBody
				files={files}
				visibleFiles={visibleFiles}
				selected={selected}
				toggleSelect={toggleSelect}
				colTemplate={colTemplate}
				renderMetricCols={renderMetricCols}
				emptyTitle={emptyTitle}
				emptyDescription={emptyDescription}
			/>
		</div>
	);
};
