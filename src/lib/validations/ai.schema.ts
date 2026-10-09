import { z } from "zod";

export const categorizeSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(10000).optional().default(""),
  requirements: z.string().max(5000).optional().default(""),
});

export const scamCheckSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(10000),
  requirements: z.string().max(5000).optional().default(""),
  company: z.string().max(200).optional().default(""),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(2).max(200),
  top_k: z.number().int().min(1).max(50).optional().default(10),
});

export const recommendSchema = z.object({
  skills: z.array(z.string().max(50)).max(50).default([]),
  job_titles: z.array(z.string().max(100)).max(20).default([]),
  summary: z.string().max(2000).optional().default(""),
  top_k: z.number().int().min(1).max(20).optional().default(5),
});

export type CategorizeInput = z.infer<typeof categorizeSchema>;
export type ScamCheckInput = z.infer<typeof scamCheckSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type RecommendInput = z.infer<typeof recommendSchema>;