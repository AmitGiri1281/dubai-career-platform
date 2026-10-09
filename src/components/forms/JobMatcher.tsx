"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Plus,
  X,
  Briefcase,
  MapPin,
  Building2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatSalary } from "@/lib/utils";

interface RecResult {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  matchScore: number;
  reason: string;
}

export default function JobMatcher() {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<RecResult[]>([]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const addTitle = () => {
    const s = titleInput.trim();
    if (s && !jobTitles.includes(s) && jobTitles.length < 5) {
      setJobTitles([...jobTitles, s]);
      setTitleInput("");
    }
  };

  const run = async () => {
    if (skills.length === 0 && jobTitles.length === 0 && !summary) {
      toast.error("Please add at least one skill or job title.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          job_titles: jobTitles,
          summary,
          top_k: 6,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResults(json.data.recommendations);
      toast.success(`Found ${json.data.recommendations.length} matches!`);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {results.length === 0 ? (
        <div className="card-base space-y-5">
          {/* Skills */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Your skills
            </label>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
                placeholder="e.g., React, Python, Nursing…"
                className="input-base flex-1"
              />
              <button type="button" onClick={addSkill} className="btn-outline">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job titles */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Previous job titles (optional)
            </label>
            <div className="flex gap-2">
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTitle())
                }
                placeholder="e.g., Senior Developer, ICU Nurse…"
                className="input-base flex-1"
              />
              <button type="button" onClick={addTitle} className="btn-outline">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {jobTitles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {jobTitles.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() =>
                        setJobTitles(jobTitles.filter((x) => x !== s))
                      }
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Short summary (optional)
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., 5 years building web apps in fintech…"
              rows={3}
              className="input-base py-2"
            />
          </div>

          <button
            onClick={run}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding matches…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Find Matching Jobs
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing top {results.length} matches
            </p>
            <button
              onClick={() => setResults([])}
              className="text-sm font-medium text-primary hover:underline"
            >
              Start over
            </button>
          </div>

          <div className="space-y-3">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/jobs/${r.slug}`}
                className="card-base block transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.matchScore >= 0.5 ? "success" : "info"}>
                        {Math.round(r.matchScore * 100)}% match
                      </Badge>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold">
                      {r.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {r.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {r.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {r.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-primary">{r.reason}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {formatSalary(r.salaryMin, r.salaryMax, r.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}