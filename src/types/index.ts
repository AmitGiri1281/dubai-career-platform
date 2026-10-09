export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT";
export type InquiryStatus = "NEW" | "IN_PROGRESS" | "CLOSED";
export type Role = "USER" | "ADMIN" | "EDITOR";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | Record<string, unknown>;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ContactInquiry {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}