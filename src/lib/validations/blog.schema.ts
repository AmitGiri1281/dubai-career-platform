import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(20),
  coverImage: z.string().url().optional().nullable().or(z.literal("")),
  isPublished: z.coerce.boolean().default(false),
});

export type BlogInput = z.infer<typeof blogSchema>;