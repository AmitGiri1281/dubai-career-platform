import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[+]?[\d\s()-]{6,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  service: z.string().max(100).optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;