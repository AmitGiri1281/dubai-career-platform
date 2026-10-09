import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [jobs, blogs] = await Promise.all([
    prisma.job.findMany({
      where: {
        isPublished: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),

    prisma.blog.findMany({
      where: {
        isPublished: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/jobs`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/success-stories`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...jobPages, ...blogPages];
}