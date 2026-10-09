import type { Metadata } from "next";
import Link from "next/link";
import { Star, Quote, ArrowRight, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Success Stories | Dubai Career Support",
  description:
    "Read testimonials from job seekers who landed their dream roles in Dubai and the UAE through our career support services.",
  alternates: { canonical: "/success-stories" },
};

export default async function SuccessStoriesPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + t.rating, 0) /
          testimonials.length
        ).toFixed(1)
      : "5.0";

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Success Stories
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Real careers, real results
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Thousands of job seekers have trusted us to guide them into top UAE
            employers. Here are some of their stories.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-display text-2xl font-bold text-primary">
                {testimonials.length}+
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Reviews</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-display text-2xl font-bold text-primary">
                {avgRating}
              </p>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-amber-500 text-amber-500"
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-display text-2xl font-bold text-primary">5000+</p>
              <p className="mt-1 text-xs text-muted-foreground">Placed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="container-page py-16 lg:py-20">
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No success stories yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.id} className="card-base flex flex-col">
                <Quote className="h-8 w-8 text-primary/30" />

                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  "{t.message}"
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.role}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-bold">
            Ready to write your own success story?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Start your UAE career journey with us today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/jobs" className="btn-outline">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}