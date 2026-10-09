"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ScamResult {
  is_suspicious: boolean;
  risk_score: number;
  flags: string[];
  recommendation: string;
}

export default function ScamChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    company: "",
    salaryMin: "",
    salaryMax: "",
  });

  const check = async () => {
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          requirements: form.requirements,
          company: form.company,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResult(json.data);
      toast.success("Scam check complete");
    } catch (err: any) {
      toast.error(err.message ?? "Check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-base">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">
          Manual Scam Check
        </h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste a job posting to check for scam signals.
      </p>

      <div className="mt-4 space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Job title *"
          className="input-base"
        />
        <input
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="Company name (optional)"
          className="input-base"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Job description *"
          rows={3}
          className="input-base py-2"
        />
        <textarea
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          placeholder="Requirements (optional)"
          rows={2}
          className="input-base py-2"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={form.salaryMin}
            onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
            placeholder="Min salary (AED)"
            className="input-base"
          />
          <input
            type="number"
            value={form.salaryMax}
            onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
            placeholder="Max salary (AED)"
            className="input-base"
          />
        </div>

        <button
          onClick={check}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>Run Scam Check</>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`mt-5 rounded-xl border p-4 ${
            result.is_suspicious
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.is_suspicious ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
            <p
              className={`font-semibold ${
                result.is_suspicious ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {result.is_suspicious ? "Suspicious" : "Looks Safe"}
            </p>
            <span className="ml-auto text-sm font-medium">
              Risk: {Math.round(result.risk_score * 100)}%
            </span>
          </div>

          {result.flags.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {result.flags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-sm font-medium">
            {result.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}