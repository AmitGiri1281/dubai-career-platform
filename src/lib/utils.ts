import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSalary(min?: number | null, max?: number | null, currency = "AED"): string {
  if (!min && !max) return "Negotiable";
  if (min && max) return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
  if (min) return `From ${currency} ${min.toLocaleString()}`;
  return `Up to ${currency} ${max!.toLocaleString()}`;
}

export function truncate(str: string, length = 120): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}