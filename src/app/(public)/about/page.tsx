import type { Metadata } from "next";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  ShieldCheck,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Dubai Career Support",
  description:
    "Learn about our mission to help job seekers build careers in Dubai and the UAE with professional guidance and verified opportunities.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            About Us
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Guiding careers, building futures
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We're a team of UAE career specialists dedicated to connecting job
            seekers with meaningful opportunities across Dubai and the Emirates.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">
              Our story
            </h2>
            <div className="mt-5 space-y-4 text-muted-foreground">
              <p>
                Dubai Career Support was founded with a simple mission: make
                the UAE job market accessible to everyone. We noticed too many
                talented professionals struggled with the nuances of applying
                for jobs abroad — from ATS-friendly CVs to visa documentation.
              </p>
              <p>
                Over the years, we've helped thousands of job seekers from
                across the world land roles in technology, healthcare,
                hospitality, engineering, and finance. We combine local UAE
                expertise with modern tools and personalized coaching.
              </p>
              <p>
                Today, we're proud to be one of the most trusted career support
                platforms in the region.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Job seekers helped", value: "5,000+" },
              { label: "Partner employers", value: "200+" },
              { label: "Placement rate", value: "92%" },
              { label: "Years in UAE", value: "10+" },
            ].map((s) => (
              <div key={s.label} className="card-base text-center">
                <p className="font-display text-3xl font-bold text-primary">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-secondary/40 py-16 lg:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Our Values
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              What we stand for
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Integrity",
                desc: "Verified listings, honest advice, no false promises.",
              },
              {
                icon: Users,
                title: "People First",
                desc: "Every candidate gets personalized attention.",
              },
              {
                icon: Award,
                title: "Excellence",
                desc: "We hold ourselves to the highest standards.",
              },
              {
                icon: Heart,
                title: "Empathy",
                desc: "We understand the challenges of job hunting abroad.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-base">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-base">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">
              Our Mission
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To empower job seekers worldwide with the tools, guidance, and
              opportunities they need to build successful careers in the UAE.
            </p>
          </div>

          <div className="card-base">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Eye className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">
              Our Vision
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To become the most trusted career support platform in the Middle
              East — bridging talent and opportunity across borders.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="rounded-3xl gradient-gold p-10 text-center text-white shadow-xl sm:p-14">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Let's build your UAE career together
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-95">
            Reach out to our team and discover how we can help.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 shadow hover:bg-white/90"
            >
              Contact Us
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}