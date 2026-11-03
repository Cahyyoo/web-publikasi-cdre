import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  extraQuery?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  extraQuery?: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  if (extraQuery) {
    for (const [key, value] of Object.entries(extraQuery)) {
      if (value) params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

/** Page numbers rendered at once, excluding the first/last anchors. */
const WINDOW = 5;

/**
 * Page numbers to render: always the first and last, a window around the
 * current page, and an ellipsis for each gap. Rendering every number meant a
 * 400-post section put 50 links in the DOM of every list page.
 */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= WINDOW + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(WINDOW / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(totalPages - 1, start + WINDOW - 1);
  start = Math.max(2, end - WINDOW + 1);

  const items: (number | "gap")[] = [1];
  if (start > 2) items.push("gap");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);
  return items;
}

export default function Pagination({
  basePath,
  page,
  totalPages,
  extraQuery,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={buildHref(basePath, Math.max(1, page - 1), extraQuery)}
        aria-disabled={page <= 1}
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-cream-dark text-brand hover:bg-brand/10 ${
          page <= 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center text-sm text-stone-400"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(basePath, item, extraQuery)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
              item === page
                ? "bg-brand text-white"
                : "bg-cream-dark text-stone-600 hover:bg-brand/10"
            }`}
          >
            {item}
          </Link>
        )
      )}

      <Link
        href={buildHref(basePath, Math.min(totalPages, page + 1), extraQuery)}
        aria-disabled={page >= totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-cream-dark text-brand hover:bg-brand/10 ${
          page >= totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
