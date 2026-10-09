"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Users, Loader2, Plus, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatSalary } from "@/lib/utils";

interface RecResult {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  matchScore: number;
  reason: string;
}

export default function JobRecommendationTester() {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<RecResult[]>([]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((x) => x !== s));
  };

  const run = async () => {
    if (skills.length === 0 && !summary) {
      toast.error("Add at least one skill or a summary");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          summary,
          job_titles: [],
          top_k: 5,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResults(json.data.recommendations);
      toast.success(`Found ${json.data.recommendations.length} matches`);
    } catch (err: any) {
      toast.error(err.message ?? "Recommendation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-base">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">
          Test Job Recommendations
        </h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter skills to see which jobs match best.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSkill())
            }
            placeholder="e.g., React, Python, Nurse…"
            className="input-base flex-1"
          />
          <button
            type="button"
            onClick={addSkill}
            className="btn-outline px-3"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Optional: short summary of experience"
          rows={2}
          className="input-base py-2"
        />

        <button onClick={run} disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Matching…
            </>
          ) : (
            <>Find Matching Jobs</>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium">Top matches</p>
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/jobs/${r.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-border p-3 text-sm transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.company} · {r.location}
                  </p>
                  <p className="mt-1 text-xs text-primary">{r.reason}</p>
                </div>
                <Badge variant={r.matchScore >= 0.5 ? "success" : "info"}>
                  {Math.round(r.matchScore * 100)}%
                </Badge>
              </div>
              <p className="mt-2 text-xs font-medium text-primary">
                {formatSalary(r.salaryMin, r.salaryMax, r.currency)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}