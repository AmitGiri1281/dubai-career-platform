import Link from "next/link";
import { Home, Briefcase, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-secondary/40 p-4">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-8xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home className="mr-2 h-4 w-4" /> Go Home
          </Link>
          <Link href="/jobs" className="btn-outline">
            <Briefcase className="mr-2 h-4 w-4" /> Browse Jobs
          </Link>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-left">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 text-primary" /> Looking for something?
          </p>
          <form action="/jobs" method="get" className="mt-3 flex gap-2">
            <input
              name="q"
              placeholder="Search jobs…"
              className="input-base flex-1"
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}