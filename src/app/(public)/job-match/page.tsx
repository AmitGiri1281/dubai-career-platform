import type { Metadata } from "next";
import JobMatcher from "@/components/forms/JobMatcher";

export const metadata: Metadata = {
  title: "AI Job Matcher | Dubai Career Support",
  description:
    "Enter your skills and get AI-powered job recommendations from our verified UAE listings — free.",
  alternates: { canonical: "/job-match" },
};

export default function JobMatchPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            AI Tool
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Find jobs that match your skills
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Enter your skills and experience — our AI will rank the best-matching
            UAE jobs for you.
          </p>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <JobMatcher />
        </div>
      </section>
    </>
  );
}