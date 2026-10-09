import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5).max(2000),
  category: z.string().max(50).optional().nullable().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type FaqInput = z.infer<typeof faqSchema>;