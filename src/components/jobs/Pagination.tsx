"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pages: number;
}

export default function Pagination({ page, pages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (pages <= 1) return null;

  const go = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`${pathname}?${next.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(pages, page + windowSize);
  const pagesArr: number[] = [];
  for (let i = start; i <= end; i += 1) pagesArr.push(i);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="btn-outline h-9 w-9 p-0 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => go(1)} className="btn-outline h-9 min-w-9 p-0">
            1
          </button>
          {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {pagesArr.map((p) => (
        <button
          key={p}
          onClick={() => go(p)}
          className={cn(
            "h-9 min-w-9 rounded-md px-3 text-sm font-medium transition",
            p === page
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background hover:bg-accent"
          )}
        >
          {p}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <button
            onClick={() => go(pages)}
            className="btn-outline h-9 min-w-9 p-0"
          >
            {pages}
          </button>
        </>
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page >= pages}
        className="btn-outline h-9 w-9 p-0 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}