import { z } from "zod";

export const jobSchema = z
  .object({
    title: z.string().min(3).max(200),
    company: z.string().min(2).max(200),
    location: z.string().min(2).max(200).default("Dubai, UAE"),
    description: z.string().min(20).max(10000),
    requirements: z.string().min(10).max(5000),
    salaryMin: z.coerce.number().int().positive().optional().nullable(),
    salaryMax: z.coerce.number().int().positive().optional().nullable(),
    currency: z.string().default("AED"),
    type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
    remote: z.coerce.boolean().default(false),
    categoryId: z.string().cuid().optional().nullable(),
    expiresAt: z.coerce.date().optional().nullable(),
    isPublished: z.coerce.boolean().default(false),
  })
  .refine(
    (d) => !d.salaryMin || !d.salaryMax || d.salaryMin <= d.salaryMax,
    { message: "salaryMin must be <= salaryMax", path: ["salaryMax"] }
  );

export const jobFilterSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).optional(),
  remote: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type JobInput = z.infer<typeof jobSchema>;
export type JobFilter = z.infer<typeof jobFilterSchema>;