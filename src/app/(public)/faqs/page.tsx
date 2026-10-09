import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Dubai Career Support",
  description:
    "Answers to common questions about jobs, CVs, UAE visas, documentation, and our career services.",
  alternates: { canonical: "/faqs" },
};

export default async function FaqsPage() {
  const faqs = await prisma.fAQ.findMany({
  where: { isActive: true },
  orderBy: {
    order: "asc",
  },
});

  // Group by category
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.category ?? "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Find answers to the most common questions about our services and
            the UAE job market.
          </p>
        </div>
      </section>

      {/* FAQ groups */}
      <section className="container-page py-16 lg:py-20">
        {faqs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No FAQs published yet.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-12">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="mb-4 inline-flex items-center gap-2 font-display text-xl font-semibold">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {cat.charAt(0)}
                  </span>
                  {cat}
                </h2>

                <div className="space-y-3">
                  {grouped[cat].map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-xl border border-border bg-card p-5 open:shadow-sm"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                        <span>{faq.question}</span>
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Help CTA */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="rounded-3xl gradient-gold p-10 text-center text-white shadow-xl sm:p-14">
          <MessageCircle className="mx-auto h-10 w-10" />
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Still have questions?
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-95">
            Our team is here to help. Reach out and we'll get back to you within
            24 hours.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 shadow hover:bg-white/90"
            >
              Contact Us
            </Link>
            <Link
              href="/services"
              className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              View Services
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}