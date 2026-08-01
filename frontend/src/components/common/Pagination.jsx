import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * ForestGuard Pagination
 *
 * Props:
 * currentPage   - current page number
 * totalPages    - total number of pages
 * onPageChange  - function(page)
 * totalItems    - optional total record count
 * pageSize      - optional items per page
 * showInfo      - show "Showing X-Y of Z"
 * siblingCount  - pages shown around current page
 */

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 10,
  showInfo = true,
  siblingCount = 1,
  className = "",
}) {
  /* =========================================================
     Safety
  ========================================================= */

  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);

  const safeCurrentPage = Math.min(
    Math.max(Number(currentPage) || 1, 1),
    safeTotalPages,
  );

  /* =========================================================
     Change Page
  ========================================================= */

  const changePage = (page) => {
    if (!onPageChange) return;

    const nextPage = Math.min(Math.max(page, 1), safeTotalPages);

    if (nextPage === safeCurrentPage) return;

    onPageChange(nextPage);
  };

  /* =========================================================
     Pagination Range
  ========================================================= */

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 5;

    /*
      Example:
      1 2 3 4 5
    */
    if (safeTotalPages <= totalNumbers) {
      return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
    }

    const leftSibling = Math.max(safeCurrentPage - siblingCount, 1);

    const rightSibling = Math.min(
      safeCurrentPage + siblingCount,
      safeTotalPages,
    );

    const showLeftDots = leftSibling > 2;

    const showRightDots = rightSibling < safeTotalPages - 1;

    /*
      Example:
      1 2 3 ... 20
    */
    if (!showLeftDots && showRightDots) {
      const leftCount = 3 + siblingCount * 2;

      const leftRange = Array.from(
        { length: leftCount },
        (_, index) => index + 1,
      );

      return [...leftRange, "right-dots", safeTotalPages];
    }

    /*
      Example:
      1 ... 18 19 20
    */
    if (showLeftDots && !showRightDots) {
      const rightCount = 3 + siblingCount * 2;

      const start = safeTotalPages - rightCount + 1;

      const rightRange = Array.from(
        { length: rightCount },
        (_, index) => start + index,
      );

      return [1, "left-dots", ...rightRange];
    }

    /*
      Example:
      1 ... 8 9 10 ... 20
    */
    const middleRange = [];

    for (let page = leftSibling; page <= rightSibling; page++) {
      middleRange.push(page);
    }

    return [1, "left-dots", ...middleRange, "right-dots", safeTotalPages];
  };

  const pages = getPageNumbers();

  /* =========================================================
     Showing Information
  ========================================================= */

  const startItem = totalItems > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0;

  const endItem =
    totalItems > 0 ? Math.min(safeCurrentPage * pageSize, totalItems) : 0;

  /* =========================================================
     Button Styles
  ========================================================= */

  const navigationButton = `
    w-9
    h-9
    inline-flex
    items-center
    justify-center
    rounded-xl
    border
    transition-all
    duration-200
    outline-none

    disabled:opacity-35
    disabled:cursor-not-allowed
    disabled:hover:scale-100

    hover:scale-105
    active:scale-95
  `;

  /* =========================================================
     Render
  ========================================================= */

  if (safeTotalPages <= 1 && !showInfo) {
    return null;
  }

  return (
    <div
      className={`
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
        ${className}
      `}
    >
      {/* =====================================================
          Information
      ===================================================== */}

      {showInfo && (
        <div
          className="text-sm"
          style={{
            color: "var(--text-muted, #94a3b8)",
          }}
        >
          {totalItems > 0 ? (
            <>
              Showing{" "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary, #f8fafc)",
                }}
              >
                {startItem}
              </span>
              {" - "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary, #f8fafc)",
                }}
              >
                {endItem}
              </span>
              {" of "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary, #f8fafc)",
                }}
              >
                {totalItems}
              </span>
              {" results"}
            </>
          ) : (
            <>
              Page{" "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary, #f8fafc)",
                }}
              >
                {safeCurrentPage}
              </span>
              {" of "}
              <span
                className="font-semibold"
                style={{
                  color: "var(--text-primary, #f8fafc)",
                }}
              >
                {safeTotalPages}
              </span>
            </>
          )}
        </div>
      )}

      {/* =====================================================
          Navigation
      ===================================================== */}

      {safeTotalPages > 1 && (
        <nav
          className="
            flex
            items-center
            gap-1.5
            overflow-x-auto
            max-w-full
          "
          aria-label="Pagination"
        >
          {/* First Page */}

          <button
            type="button"
            className={navigationButton}
            disabled={safeCurrentPage === 1}
            onClick={() => changePage(1)}
            aria-label="Go to first page"
            title="First page"
            style={{
              color: "var(--text-muted, #94a3b8)",

              background: "var(--bg-card, #111827)",

              borderColor: "var(--bg-border, #1f2937)",
            }}
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous */}

          <button
            type="button"
            className={navigationButton}
            disabled={safeCurrentPage === 1}
            onClick={() => changePage(safeCurrentPage - 1)}
            aria-label="Go to previous page"
            title="Previous page"
            style={{
              color: "var(--text-muted, #94a3b8)",

              background: "var(--bg-card, #111827)",

              borderColor: "var(--bg-border, #1f2937)",
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page Numbers */}

          {pages.map((page, index) => {
            if (page === "left-dots" || page === "right-dots") {
              return (
                <span
                  key={`${page}-${index}`}
                  className="
                    w-9
                    h-9
                    flex
                    items-center
                    justify-center
                    text-sm
                    select-none
                  "
                  style={{
                    color: "var(--text-faint, #64748b)",
                  }}
                >
                  •••
                </span>
              );
            }

            const active = page === safeCurrentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => changePage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={active ? "page" : undefined}
                className="
                  w-9
                  h-9
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  hover:scale-105
                  active:scale-95
                "
                style={{
                  color: active ? "#ffffff" : "var(--text-muted, #94a3b8)",

                  background: active
                    ? "linear-gradient(135deg, #16a34a, #22c55e)"
                    : "var(--bg-card, #111827)",

                  borderColor: active
                    ? "rgba(74, 222, 128, 0.45)"
                    : "var(--bg-border, #1f2937)",

                  boxShadow: active
                    ? "0 5px 18px rgba(34,197,94,0.20)"
                    : "none",
                }}
              >
                {page}
              </button>
            );
          })}

          {/* Next */}

          <button
            type="button"
            className={navigationButton}
            disabled={safeCurrentPage === safeTotalPages}
            onClick={() => changePage(safeCurrentPage + 1)}
            aria-label="Go to next page"
            title="Next page"
            style={{
              color: "var(--text-muted, #94a3b8)",

              background: "var(--bg-card, #111827)",

              borderColor: "var(--bg-border, #1f2937)",
            }}
          >
            <ChevronRight size={16} />
          </button>

          {/* Last Page */}

          <button
            type="button"
            className={navigationButton}
            disabled={safeCurrentPage === safeTotalPages}
            onClick={() => changePage(safeTotalPages)}
            aria-label="Go to last page"
            title="Last page"
            style={{
              color: "var(--text-muted, #94a3b8)",

              background: "var(--bg-card, #111827)",

              borderColor: "var(--bg-border, #1f2937)",
            }}
          >
            <ChevronsRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}

export default Pagination;
