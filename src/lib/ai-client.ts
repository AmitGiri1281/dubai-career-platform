/**
 * Client for the AI microservice.
 * Wraps fetch calls with API key auth and error handling.
 */

const AI_BASE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
const AI_API_KEY = process.env.AI_SERVICE_API_KEY ?? "";

export interface AIError {
  error: string;
  status: number;
}

async function aiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${AI_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "x-api-key": AI_API_KEY,
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
    // Don't cache AI responses
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`AI service error (${res.status}): ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

export const aiClient = {
  health: () => aiFetch<{ status: string }>("/health"),

  analyzeResume: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return aiFetch<{
      score: number;
      skills_found: string[];
      missing_sections: string[];
      suggestions: string[];
      word_count: number;
      has_contact: boolean;
      has_experience: boolean;
      has_education: boolean;
    }>("/resume/analyze", { method: "POST", body: fd });
  },

  recommendJobs: (payload: {
    skills: string[];
    job_titles: string[];
    summary?: string;
    jobs: { id: string; title: string; description: string; requirements?: string }[];
    top_k?: number;
  }) =>
    aiFetch<{ recommendations: { id: string; score: number; reason: string }[] }>(
      "/jobs/recommend",
      { method: "POST", body: JSON.stringify(payload) }
    ),

  categorizeJob: (payload: {
    title: string;
    description?: string;
    requirements?: string;
  }) =>
    aiFetch<{ category: string; confidence: number; alternatives: string[] }>(
      "/jobs/categorize",
      { method: "POST", body: JSON.stringify(payload) }
    ),

  searchJobs: (payload: {
    query: string;
    jobs: { id: string; title: string; description: string; requirements?: string }[];
    top_k?: number;
  }) =>
    aiFetch<{ results: { id: string; score: number }[] }>("/jobs/search", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  scamCheck: (payload: {
    title: string;
    description: string;
    requirements?: string;
    company?: string;
    salaryMin?: number;
    salaryMax?: number;
  }) =>
    aiFetch<{
      is_suspicious: boolean;
      risk_score: number;
      flags: string[];
      recommendation: string;
    }>("/jobs/scam-check", { method: "POST", body: JSON.stringify(payload) }),
};