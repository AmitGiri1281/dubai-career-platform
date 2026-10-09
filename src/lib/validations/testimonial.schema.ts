import { z } from "zod";

export const testimonialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  role: z
    .string()
    .trim()
    .min(2, "Role is required")
    .max(150, "Role is too long"),

  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),

  imageUrl: z
    .string()
    .trim()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .default(5),

  isActive: z
    .boolean()
    .default(true),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;