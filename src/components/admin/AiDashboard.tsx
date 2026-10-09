"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  ShieldAlert,
  Search,
  Users,
  Wand2,
  Loader2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import ScamChecker from "./ScamChecker";
import JobRecommendationTester from "./JobRecommendationTester";

interface Stats {
  totalJobs: number;
  jobsWithoutCategory: number;
  jobsWithHighSalary: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  categoryId: string | null;
}

interface Props {
  stats: Stats;
  recentJobs: Job[];
}

export default function AiDashboard({ stats, recentJobs }: Props) {
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResults, setBulkResults] = useState<
    Record<string, { category: string; confidence: number }>
  >({});

  const runBulkCategorize = async () => {
    const uncategorized = recentJobs.filter((j) => !j.categoryId);
    if (uncategorized.length === 0) {
      toast.info("All recent jobs already have categories.");
      return;
    }

    setBulkRunning(true);
    const results: Record<string, { category: string; confidence: number }> = {};

    for (const job of uncategorized) {
      try {
        const res = await fetch("/api/ai/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: job.title,
            description: job.description,
            requirements: job.requirements,
          }),
        });
        const json = await res.json();
        if (json.success) {
          results[job.id] = json.data;
        }
      } catch {
        // skip
      }
    }

    setBulkResults(results);
    setBulkRunning(false);
    toast.success(`Categorized ${Object.keys(results).length} jobs`);
  };

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-base">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Total jobs</p>
          <p className="font-display text-3xl font-bold">{stats.totalJobs}</p>
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <Wand2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Uncategorized jobs
          </p>
          <p className="font-display text-3xl font-bold">
            {stats.jobsWithoutCategory}
          </p>
          {stats.jobsWithoutCategory > 0 && (
            <button
              onClick={runBulkCategorize}
              disabled={bulkRunning}
              className="btn-primary mt-4 w-full text-xs"
            >
              {bulkRunning ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Categorizing…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-3 w-3" />
                  Auto-categorize all
                </>
              )}
            </button>
          )}
        </div>

        <div className="card-base">
          <div className="flex items-center justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-100 text-red-700">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            High-salary jobs (&gt;100k)
          </p>
          <p className="font-display text-3xl font-bold">
            {stats.jobsWithHighSalary}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Run scam-check below to verify
          </p>
        </div>
      </div>

      {/* Bulk categorize results */}
      {Object.keys(bulkResults).length > 0 && (
        <div className="card-base">
          <h3 className="font-semibold">Bulk categorization results</h3>
          <div className="mt-3 space-y-2">
            {Object.entries(bulkResults).map(([jobId, result]) => {
              const job = recentJobs.find((j) => j.id === jobId);
              if (!job) return null;
              return (
                <div
                  key={jobId}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <span className="font-medium">{job.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{result.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.confidence * 100)}% confident
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-column tools */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scam Checker */}
        <ScamChecker />

        {/* Recommendation Tester */}
        <JobRecommendationTester />
      </div>

      {/* AI Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Sparkles,
            title: "Resume Analyzer",
            desc: "Score CVs and suggest improvements.",
            href: "/resume-check",
            cta: "Open public page",
          },
          {
            icon: Users,
            title: "Job Recommender",
            desc: "Match skills to open jobs.",
            href: "/job-match",
            cta: "Open public page",
          },
          {
            icon: Search,
            title: "Semantic Search",
            desc: "Search jobs by meaning.",
            href: "/jobs/smart-search",
            cta: "Open public page",
          },
        ].map(({ icon: Icon, title, desc, href, cta }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="card-base transition hover:border-primary/40"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-3 inline-block text-xs font-medium text-primary">
              {cta} →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}