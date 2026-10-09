"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  jobId: string;
  title: string;
  description: string;
  requirements: string;
  company: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

export default function ScamWarningBadge({
  title,
  description,
  requirements,
  company,
  salaryMin,
  salaryMax,
}: Props) {
  const [flags, setFlags] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch("/api/ai/scam-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            requirements,
            company,
            salaryMin: salaryMin ?? undefined,
            salaryMax: salaryMax ?? undefined,
          }),
        });
        const json = await res.json();
        if (mounted && json.success && json.data.is_suspicious) {
          setFlags(json.data.flags);
        }
      } catch {
        // silent
      } finally {
        if (mounted) setChecking(false);
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, [title, description, requirements, company, salaryMin, salaryMax]);

  if (checking || dismissed || flags.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="font-semibold text-amber-800">
            ⚠️ This posting shows some unusual signals
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Please verify the employer independently before sharing personal
            information or making any payment.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-amber-700">
            {flags.map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-amber-600 hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}