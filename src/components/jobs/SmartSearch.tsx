"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  MapPin,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  score: number;
}

const EXAMPLES = [
  "high paying tech job in Dubai",
  "nurse job with no night shifts",
  "remote developer role",
  "hotel manager in Palm Jumeirah",
  "construction engineer with AutoCAD",
];

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const search = async () => {
    if (query.trim().length < 2) {
      toast.error("Enter at least 2 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 10 }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResults(json.data.results);
      toast.success(`Found ${json.data.results.length} matching jobs`);
    } catch (err: any) {
      toast.error(err.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-base">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Describe the job you want…"
              className="input-base pl-9"
            />
          </div>
          <button
            onClick={search}
            disabled={loading}
            className="btn-primary px-5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </button>
        </div>

        {!results && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Try one of these
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    setTimeout(search, 50);
                  }}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {results && results.length === 0 && (
        <div className="card-base text-center py-12">
          <p className="text-muted-foreground">
            No jobs matched your search. Try different words.
          </p>
        </div>
      )}

      {results && results.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} matching jobs
            </p>
            <button
              onClick={() => {
                setResults(null);
                setQuery("");
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="space-y-3">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/jobs/${r.slug}`}
                className="card-base flex items-center justify-between gap-4 transition hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-semibold">{r.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {r.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {r.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {Math.round(r.score * 100)}% match
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}