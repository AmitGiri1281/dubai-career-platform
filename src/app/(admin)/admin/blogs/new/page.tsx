import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPage() {
  return (
    <div>
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blogs
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold">Create blog</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Write an article. Save as draft or publish immediately.
      </p>

      <BlogForm />
    </div>
  );
}