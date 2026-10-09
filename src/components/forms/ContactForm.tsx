"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import {
  inquirySchema,
  type InquiryInput,
} from "@/lib/validations/inquiry.schema";

const SERVICES = [
  "CV / Resume Preparation",
  "Job Application Assistance",
  "Interview Preparation",
  "Travel & Documentation",
  "Career Counseling",
  "General Inquiry",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({ resolver: zodResolver(inquirySchema) as any });

  const onSubmit = async (data: InquiryInput) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof json.error === "string"
            ? json.error
            : "Failed to send message"
        );
      }

      toast.success("Message sent! We'll reply within 24 hours.");
      setSubmitted(true);
      reset();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    }
  };

  if (submitted) {
    return (
      <div className="card-base text-center py-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h3 className="mt-4 font-display text-xl font-semibold">
          Thank you for reaching out!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We've received your message and will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-outline mt-6"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-base space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Full name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("name")}
            className="input-base"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className="input-base"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Phone (optional)
          </label>
          <input
            {...register("phone")}
            className="input-base"
            placeholder="+971 50 123 4567"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Service (optional)
          </label>
          <select {...register("service")} className="input-base">
            <option value="">Select a service</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register("message")}
          rows={5}
          className="input-base min-h-[120px] py-2"
          placeholder="Tell us how we can help…"
        />
        {errors.message && (
          <p className="mt-1 text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        We'll never share your information. Read our privacy policy.
      </p>
    </form>
  );
}