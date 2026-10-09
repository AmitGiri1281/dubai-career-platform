import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, Calendar, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, truncate } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Career Blog | Dubai Career Support",
  description:
    "Insights, tips, and guides for building your career in Dubai and the UAE.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage() {
  const posts = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Blog
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Career insights for the UAE
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Practical tips, market trends, and guides from our career experts.
          </p>
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No articles published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group card-base flex flex-col overflow-hidden p-0"
              >
                <div className="relative aspect-video bg-secondary">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read article <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}