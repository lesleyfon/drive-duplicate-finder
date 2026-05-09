import { createFileRoute } from "@tanstack/react-router";
import { Clock, InfoIcon, SearchIcon } from "lucide-react";
import { useMemo } from "react";

import { DeleteModal } from "../../components/DeleteModal";
import { NoResult } from "../../components/no-result";
import { Table } from "../../components/table";
import { useFileListState } from "../../hooks/useFileListState";
import { cn } from "../../lib/cn";
import { OLD_FILES_LIMIT } from "../../lib/deduplicator";
import { formatBytes, formatDate } from "../../lib/formatters";
import { useScanStore } from "../../store/scanStore";
import type { FileRecord } from "../../types/drive";

export type OldSortType = "date" | "name" | "size";

const OLD_SORT_TABS: { key: OldSortType; label: string }[] = [
  { key: "date", label: "DATE CREATED" },
  { key: "name", label: "NAME" },
  { key: "size", label: "FILE SIZE" },
];

const TABLE_COL_TEMPLATE = "28px 36px 56px 1fr 110px 72px";

export const Route = createFileRoute("/_authenticated/old-files")({
  component: RouteComponent,
});

function sortOldFiles(files: FileRecord[], sort: OldSortType): FileRecord[] {
  const result = [...files];
  if (sort === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "size") {
    result.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
  } else {
    result.sort((a, b) => a.createdTime.localeCompare(b.createdTime));
  }
  return result;
}

function RouteComponent() {
  const scanResults = useScanStore((s) => s.scanResults);
  const files = scanResults?.oldFiles ?? [];
  const hasScanned = scanResults !== null;

  const {
    selected,
    sort,
    setSort,
    search,
    setSearch,
    showModal,
    setShowModal,
    successMessage,
    errorMessage,
    visibleFiles,
    allVisibleSelected,
    selectedFiles,
    totalSelectedBytes,
    hasSelection,
    toggleSelect,
    toggleSelectAll,
    handleConfirmDelete,
    isPending,
  } = useFileListState<OldSortType>({
    files,
    defaultSort: "date",
    sortFn: sortOldFiles,
  });

  const combinedBytes = useMemo(
    () => files.reduce((total, file) => total + (file.size ?? 0), 0),
    [files],
  );

  if (!hasScanned) {
    return (
      <NoResult
        title="Old Files"
        description="No scan data — run a scan first"
      />
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--theme-page-bg)]">
      {/* ── Page header ── */}
      <div className="px-6 py-[14px] flex items-center justify-between bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
        <div className="flex items-center gap-[10px]">
          <Clock size={18} className="text-[var(--theme-accent)]" />
          <span className="font-barlow-condensed font-extrabold text-[20px] uppercase tracking-[0.04em] text-[var(--theme-sidebar-active)]">
            Old Files
          </span>
        </div>
        <div className="flex items-center gap-[18px]">
          <span className="text-[12px] font-medium text-[var(--theme-text-secondary)]">
            {visibleFiles.length} files shown
          </span>
          <span className="text-[var(--theme-border)] select-none">|</span>
          <span>
            <span
              className="text-[14px] font-bold font-barlow-condensed"
              style={{ color: "var(--theme-large-file-size)" }}
            >
              {formatBytes(combinedBytes)}
            </span>
            <span className="text-[12px] font-medium text-[var(--theme-text-secondary)]">
              {" "}
              combined
            </span>
          </span>
          <button
            type="button"
            disabled={!hasSelection}
            onClick={() => setShowModal(true)}
            aria-label={`Delete ${selected.size} selected files`}
            className={cn(
              "px-[16px] py-[7px] rounded-sm border-none text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed transition-colors duration-150",
              hasSelection
                ? "bg-[var(--theme-delete-btn-active-bg)] text-[var(--theme-delete-btn-active-text)] cursor-pointer"
                : "bg-[var(--theme-delete-btn-bg)] text-[var(--theme-delete-btn-text)] cursor-default",
            )}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* ── Success banner ── */}
      {successMessage && (
        <div className="px-6 py-[10px] border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-topbar-bg)] shrink-0">
          <p className="text-[12px] font-semibold text-[var(--theme-accent)] font-barlow tracking-[0.04em]">
            {successMessage}
          </p>
        </div>
      )}

      {/* ── Error banner ── */}
      {errorMessage && (
        <div className="px-6 py-[10px] border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-topbar-bg)] shrink-0">
          <p className="text-[12px] font-semibold text-[var(--theme-delete-btn-active-bg)] font-barlow tracking-[0.04em]">
            {errorMessage}
          </p>
        </div>
      )}

      {/* ── Sort / filter bar ── */}
      <div className="h-[40px] px-6 flex items-center justify-between bg-[var(--theme-topbar-bg)] border-b border-[var(--theme-border)] shrink-0">
        <div className="flex items-center h-full">
          <span className="text-[9px] font-bold tracking-[0.08em] uppercase text-[var(--theme-date-text)] mr-1 shrink-0">
            Sort by
          </span>
          {OLD_SORT_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "px-[16px] h-full flex items-center text-[11px] font-bold tracking-[0.08em] uppercase font-barlow-condensed border-none bg-transparent cursor-pointer transition-colors duration-150",
                sort === key
                  ? "text-[var(--theme-sidebar-active)] border-b-2 border-[var(--theme-accent)]"
                  : "text-[var(--theme-filter-inactive)] border-b-2 border-transparent hover:text-[var(--theme-count-badge-text)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <SearchIcon
            size={12}
            className="absolute left-[9px] text-[var(--theme-date-text)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search filename or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px] h-[28px] pl-[28px] pr-[10px] text-[11px] bg-[var(--theme-search-bg)] border border-[var(--theme-border)] rounded-sm text-[var(--theme-body-text)] placeholder:text-[var(--theme-date-text)] outline-none font-barlow"
          />
        </div>
      </div>

      <Table
        files={files}
        visibleFiles={visibleFiles}
        selected={selected}
        allVisibleSelected={allVisibleSelected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        tableHeaderLabels={["RANK", "TYPE", "FILENAME", "CREATED", "SIZE"]}
        colTemplate={TABLE_COL_TEMPLATE}
        renderMetricCols={(file, typeStyle) => (
          <>
            <span
              className="text-left text-[13px] font-bold font-barlow-condensed"
              style={{ color: typeStyle.text }}
            >
              {formatDate(file.createdTime)}
            </span>
            <span className="text-[11px] text-[var(--theme-path-text)] text-left">
              {formatBytes(file.size ?? 0)}
            </span>
          </>
        )}
        emptyTitle="No old files found"
        emptyDescription={`Your ${OLD_FILES_LIMIT} oldest Google Drive files will appear here.`}
      />

      <div className="flex items-center justify-center gap-[6px] mb-5">
        <InfoIcon size={11} className="text-[var(--theme-date-text)]" />
        <span className="text-[10px] text-[#aaaaaa] font-semibold">
          Showing the top {OLD_FILES_LIMIT} oldest files in your Google Drive,
          sorted by creation date.
        </span>
      </div>

      {/* ── Delete modal ── */}
      {showModal && (
        <DeleteModal
          files={selectedFiles}
          totalBytes={totalSelectedBytes}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowModal(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
}
