import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  MessageSquare,
  Plane,
  Users,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Career Services in Dubai & UAE",
  description:
    "Professional CV preparation, job application assistance, interview coaching, travel documentation, and career counseling in Dubai.",
  alternates: { canonical: "/services" },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Briefcase,
  MessageSquare,
  Plane,
  Users,
  Star,
  ShieldCheck,
  Award,
};

const serviceDetails: Record<string, { features: string[]; price: string }> = {
  "cv-resume-preparation": {
    features: [
      "ATS-friendly formatting",
      "UAE market keyword optimization",
      "2 revisions included",
      "Cover letter add-on available",
    ],
    price: "From AED 149",
  },
  "job-application-assistance": {
    features: [
      "Verified employer network",
      "Direct application support",
      "Follow-up tracking",
      "Multiple industries covered",
    ],
    price: "Custom quote",
  },
  "interview-preparation": {
    features: [
      "1-on-1 mock interviews",
      "HR + technical rounds",
      "UAE-specific scenarios",
      "Confidence coaching",
    ],
    price: "From AED 249",
  },
  "travel-documentation-guidance": {
    features: [
      "Visa processing guidance",
      "Attestation & medicals",
      "Emirates ID assistance",
      "Travel checklist",
    ],
    price: "Custom quote",
  },
  "career-counseling": {
    features: [
      "Personalized career path",
      "Industry insights",
      "Salary negotiation tips",
      "Long-term planning",
    ],
    price: "From AED 199",
  },
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Our Services
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Complete career support for the UAE
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From CV preparation to landing your dream job — we guide you through
            every step of your UAE career journey.
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="container-page py-16 lg:py-20">
        <div className="space-y-16 lg:space-y-20">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon ?? ""] ?? Briefcase;
            const details = serviceDetails[service.slug];
            const isReversed = index % 2 === 1;

            return (
              <div
                key={service.id}
                id={service.slug}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                  isReversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Left — content */}
                <div>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    {service.description}
                  </p>

                  {details && (
                    <>
                      <ul className="mt-6 space-y-2">
                        {details.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-6 text-lg font-semibold text-primary">
                        {details.price}
                      </p>
                    </>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/contact" className="btn-primary">
                      Enquire now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link href="/jobs" className="btn-outline">
                      Browse jobs
                    </Link>
                  </div>
                </div>

                {/* Right — decorative card */}
                <div className="relative">
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/60 to-card p-8 lg:p-12">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Success rate", value: "92%" },
                        { label: "Avg. turnaround", value: "3 days" },
                        { label: "Happy clients", value: "5000+" },
                        { label: "Years experience", value: "10+" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl border border-border bg-card p-4"
                        >
                          <p className="font-display text-2xl font-bold text-primary">
                            {s.value}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="rounded-3xl gradient-gold p-10 text-center text-white shadow-xl sm:p-14">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Not sure which service you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-95">
            Book a free consultation and we'll recommend the best path for your
            career goals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 shadow hover:bg-white/90"
            >
              Get Free Consultation
            </Link>
            <Link
              href="/jobs"
              className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              View Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}