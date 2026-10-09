"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

const JOB_TYPES = [
  { value: "", label: "Any type" },
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
];

export default function JobFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page"); // reset pagination
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", q.trim() || null);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const activeCount = ["q", "categoryId", "type", "remote", "salaryMin"].filter(
    (k) => params.get(k)
  ).length;

  return (
    <>
      {/* Search bar (always visible) */}
      <form
        onSubmit={onSearch}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, company, or keyword…"
            className="input-base pl-9"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowMobile((v) => !v)}
          className="btn-outline lg:hidden"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </form>

      {/* Filter sidebar */}
      <aside
        className={cn(
          "space-y-6",
          showMobile
            ? "mt-4 block rounded-xl border border-border bg-card p-5"
            : "hidden lg:mt-6 lg:block"
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Refine</h3>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <select
            value={params.get("categoryId") ?? ""}
            onChange={(e) => updateParam("categoryId", e.target.value || null)}
            className="input-base"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Job type</label>
          <select
            value={params.get("type") ?? ""}
            onChange={(e) => updateParam("type", e.target.value || null)}
            className="input-base"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Location</label>
          <input
            defaultValue={params.get("location") ?? ""}
            onBlur={(e) => updateParam("location", e.target.value || null)}
            placeholder="e.g., Dubai, Abu Dhabi"
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Company</label>
          <input
            defaultValue={params.get("company") ?? ""}
            onBlur={(e) => updateParam("company", e.target.value || null)}
            placeholder="e.g., Emirates"
            className="input-base"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Minimum salary (AED)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            defaultValue={params.get("salaryMin") ?? ""}
            onBlur={(e) => updateParam("salaryMin", e.target.value || null)}
            placeholder="e.g., 10000"
            className="input-base"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get("remote") === "true"}
            onChange={(e) =>
              updateParam("remote", e.target.checked ? "true" : null)
            }
            className="h-4 w-4 rounded border-border"
          />
          <span>Remote only</span>
        </label>
      </aside>
    </>
  );
}