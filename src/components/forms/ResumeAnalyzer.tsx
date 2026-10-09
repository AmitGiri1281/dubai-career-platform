"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface AnalysisResult {
  score: number;
  skills_found: string[];
  missing_sections: string[];
  suggestions: string[];
  word_count: number;
  has_contact: boolean;
  has_experience: boolean;
  has_education: boolean;
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/ai/resume-analyze", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResult(json.data);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message ?? "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => {
    if (s >= 75) return "text-emerald-600";
    if (s >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Upload card */}
      {!result && (
        <div className="card-base">
          <label
            htmlFor="resume-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition hover:border-primary/40 hover:bg-secondary/60"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">
              {file ? file.name : "Click to upload your CV"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF only · Max 5MB
            </p>
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          {file && (
            <button
              onClick={analyze}
              disabled={loading}
              className="btn-primary mt-4 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>Analyze CV</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Score */}
          <div className="card-base text-center">
            <p className="text-sm text-muted-foreground">Overall score</p>
            <p className={`mt-2 font-display text-6xl font-bold ${scoreColor(result.score)}`}>
              {result.score}
              <span className="text-2xl text-muted-foreground">/100</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {result.word_count} words detected
            </p>
          </div>

          {/* Sections */}
          <div className="card-base">
            <h3 className="font-semibold">CV Sections</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { label: "Contact", ok: result.has_contact },
                { label: "Experience", ok: result.has_experience },
                { label: "Education", ok: result.has_education },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                    s.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {s.ok ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {result.skills_found.length > 0 && (
            <div className="card-base">
              <h3 className="font-semibold">Skills found</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.skills_found.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="card-base">
            <h3 className="font-semibold">Improvement suggestions</h3>
            <ul className="mt-3 space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="btn-outline flex-1"
            >
              Analyze another CV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}