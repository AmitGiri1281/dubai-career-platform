"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { jobSchema, type JobInput } from "@/lib/validations/job.schema";

interface Props {
  categories: { id: string; name: string }[];
  defaultValues?: Partial<JobInput> & { id?: string };
}

export default function JobForm({ categories, defaultValues }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(defaultValues?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema) as any,
    defaultValues: {
      currency: "AED",
      type: "FULL_TIME",
      location: "Dubai, UAE",
      remote: false,
      isPublished: false,
      ...defaultValues,
    },
  });

const onSubmit = async (data: JobInput) => {
  setSubmitting(true);
  try {
    const url = isEdit ? `/api/jobs/${defaultValues!.id}` : "/api/jobs";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(
        typeof json.error === "string"
          ? json.error
          : "Validation failed. Check your inputs."
      );
    }

    toast.success(isEdit ? "Job updated" : "Job created");
    router.push("/admin/jobs");
    router.refresh();
  } catch (err: any) {
    toast.error(err.message ?? "Something went wrong");
  } finally {
    setSubmitting(false);
  }
};

  const isPublished = watch("isPublished");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <Field label="Job title" error={errors.title?.message}>
            <input
              {...register("title")}
              className="input-base"
              placeholder="e.g., Senior Software Engineer"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company" error={errors.company?.message}>
              <input
                {...register("company")}
                className="input-base"
                placeholder="e.g., Emirates Tech"
              />
            </Field>

            <Field label="Location" error={errors.location?.message}>
              <input
                {...register("location")}
                className="input-base"
                placeholder="e.g., Dubai, UAE"
              />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={6}
              className="input-base min-h-[140px] resize-y py-2"
              placeholder="Describe the role, responsibilities, and team…"
            />
          </Field>

          <Field label="Requirements" error={errors.requirements?.message}>
            <textarea
              {...register("requirements")}
              rows={5}
              className="input-base min-h-[120px] resize-y py-2"
              placeholder="Experience, qualifications, skills…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Min salary (AED)" error={errors.salaryMin?.message}>
              <input
                type="number"
                {...register("salaryMin", { valueAsNumber: true })}
                className="input-base"
                placeholder="8000"
              />
            </Field>
            <Field label="Max salary (AED)" error={errors.salaryMax?.message}>
              <input
                type="number"
                {...register("salaryMax", { valueAsNumber: true })}
                className="input-base"
                placeholder="15000"
              />
            </Field>
            <Field label="Currency">
              <input {...register("currency")} className="input-base" />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Field label="Category" error={errors.categoryId?.message}>
              <select {...register("categoryId")} className="input-base">
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Job type" error={errors.type?.message}>
              <select {...register("type")} className="input-base">
                <option value="FULL_TIME">Full time</option>
                <option value="PART_TIME">Part time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </Field>

            <Field label="Expires at">
              <input
                type="date"
                {...register("expiresAt")}
                className="input-base"
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("remote")}
                className="h-4 w-4 rounded border-border"
              />
              <span>Remote position</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!isPublished}
                onChange={(e) => setValue("isPublished", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span>Publish immediately</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create job"}
          </button>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}