import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) notFound();

  const defaults = {
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage ?? "",
    isPublished: blog.isPublished,
  };

  return (
    <div>
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blogs
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold">Edit blog</h1>
      <p className="mb-6 text-sm text-muted-foreground">{blog.title}</p>

      <BlogForm defaultValues={defaults} />
    </div>
  );
}