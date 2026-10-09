import type { Metadata } from "next";
import SmartSearch from "@/components/jobs/SmartSearch";

export const metadata: Metadata = {
  title: "Smart Job Search | Dubai Career Support",
  description:
    "Search UAE jobs by meaning using AI. Type what you want in natural language.",
  alternates: { canonical: "/jobs/smart-search" },
};

export default function SmartSearchPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            AI Search
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Smart job search
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Describe what you're looking for in plain English. Our AI will find
            jobs that match the meaning, not just the keywords.
          </p>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <SmartSearch />
        </div>
      </section>
    </>
  );
}