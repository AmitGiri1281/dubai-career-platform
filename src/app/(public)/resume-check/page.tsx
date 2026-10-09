import type { Metadata } from "next";
import ResumeAnalyzer from "@/components/forms/ResumeAnalyzer";

export const metadata: Metadata = {
  title: "Free Resume Check | Dubai Career Support",
  description:
    "Upload your CV and get an instant AI-powered analysis with improvement suggestions — free.",
  alternates: { canonical: "/resume-check" },
};

export default function ResumeCheckPage() {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Free Tool
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            AI Resume Check
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Upload your CV (PDF) and get instant feedback on structure, skills,
            and areas to improve.
          </p>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <ResumeAnalyzer />
        </div>
      </section>
    </>
  );
}