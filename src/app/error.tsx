"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-secondary/40 p-4">
      <div className="mx-auto max-w-md text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We've logged the issue. Please try again or return home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </button>
          <Link href="/" className="btn-outline">
            <Home className="mr-2 h-4 w-4" /> Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <pre className="mt-6 overflow-auto rounded-lg bg-card p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
      </div>
    </main>
  );
}