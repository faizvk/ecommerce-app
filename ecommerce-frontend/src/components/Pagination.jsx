import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Smart pagination — collapses with ellipsis when many pages.
 * Always shows: first, last, current ± neighbours.
 *
 * Examples (current=5):
 *   2 pages:  [1] 2
 *   7 pages:  1 2 3 4 5 6 7
 *   12 pages: 1 ... 4 (5) 6 ... 12
 */
function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);

  const go = (p) => {
    if (typeof p !== "number" || p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  return (
    <nav className="flex justify-center items-center gap-1.5 md:gap-2 mt-10 flex-wrap" aria-label="Pagination">
      <button
        className="flex items-center gap-1 px-3 md:px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold text-sm cursor-pointer transition-all hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`w-9 h-9 rounded-lg font-semibold text-sm cursor-pointer border transition-all ${
              p === page
                ? "bg-brand text-white border-brand shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand hover:text-brand"
            }`}
            onClick={() => go(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="flex items-center gap-1 px-3 md:px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold text-sm cursor-pointer transition-all hover:border-brand hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
