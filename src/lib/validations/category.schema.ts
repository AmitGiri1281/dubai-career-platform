import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only")
    .optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;