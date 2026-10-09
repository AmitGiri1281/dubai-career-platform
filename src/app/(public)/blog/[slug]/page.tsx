import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Eye, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findUnique({ where: { slug } });
  if (!post) return { title: "Article not found" };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | Dubai Career Support Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blog.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  // Increment views
  void prisma.blog
    .update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {});

  const author = post.authorId
    ? await prisma.user.findUnique({
        where: { id: post.authorId },
        select: { name: true },
      })
    : null;

  return (
    <article className="container-page py-10 lg:py-14">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      <header className="mx-auto mt-6 max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          {author?.name && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> {author.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {formatDate(post.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {post.views + 1} views
          </span>
        </div>
      </header>

      {post.coverImage && (
        <div className="relative mx-auto mt-8 aspect-video max-w-4xl overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mx-auto mt-10 max-w-3xl">
        <p className="text-lg font-medium text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line leading-relaxed">
          {post.content}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6 text-center">
          <h3 className="font-display text-lg font-semibold">
            Need career help in Dubai?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our experts can guide you from CV to job offer.
          </p>
          <Link href="/contact" className="btn-primary mt-4">
            Get in touch
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            datePublished: post.createdAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: {
              "@type": "Person",
              name: author?.name ?? "Dubai Career Support",
            },
          }),
        }}
      />
    </article>
  );
}