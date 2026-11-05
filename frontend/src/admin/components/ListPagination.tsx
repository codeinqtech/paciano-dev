import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export type ListPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
  itemLabel?: string;
};

function buildPageSequence(
  current: number,
  total: number,
): (number | "gap")[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push("gap");
    }
    out.push(sorted[i]);
  }
  return out;
}

export function ListPagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
  className = "",
  itemLabel = "entries",
}: ListPaginationProps) {
  if (totalItems === 0) return null;

  const minPageOption = Math.min(...pageSizeOptions);
  const needsFooter =
    totalPages > 1 || (onPageSizeChange && totalItems > minPageOption);
  if (!needsFooter) return null;

  const sequence = buildPageSequence(page, totalPages);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      className={`admin-pagination ${className}`.trim()}
      aria-label="Pagination"
    >
      <p className="admin-pagination-summary">
        Showing{" "}
        <span className="admin-pagination-summary-strong">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        of{" "}
        <span className="admin-pagination-summary-strong">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      {totalPages > 1 ? (
        <div className="admin-pagination-track" role="group">
          <button
            type="button"
            className="admin-pagination-arrow"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          </button>

          <div className="admin-pagination-pages">
            {sequence.map((entry, idx) =>
              entry === "gap" ? (
                <span
                  key={`gap-${idx}`}
                  className="admin-pagination-ellipsis"
                  aria-hidden
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  className={
                    entry === page
                      ? "admin-pagination-page admin-pagination-page-active"
                      : "admin-pagination-page"
                  }
                  onClick={() => onPageChange(entry)}
                  aria-current={entry === page ? "page" : undefined}
                >
                  {entry}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="admin-pagination-arrow"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      ) : (
        <div className="hidden sm:block sm:flex-1" aria-hidden />
      )}

      {onPageSizeChange ? (
        <label className="admin-pagination-per-page">
          <span className="sr-only">Rows per page</span>
          <span className="admin-pagination-per-page-label">Per page</span>
          <select
            className="admin-pagination-select"
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(parseInt(e.target.value, 10) || pageSize)
            }
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </nav>
  );
}
