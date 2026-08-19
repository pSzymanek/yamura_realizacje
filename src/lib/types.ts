import type { ProjectStatus } from "@/lib/statuses";

export type StaffRole = "admin" | "employee";

export type StaffProfile = {
  id: string;
  full_name: string | null;
  role: StaffRole;
  is_active: boolean;
};

export type ProjectListItem = {
  id: string;
  order_number: string;
  title: string;
  customer_name: string;
  status: ProjectStatus;
  next_step: string | null;
  next_step_date: string | null;
  access_token: string;
  updated_at: string;
};

export type Attachment = {
  id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  created_at: string;
  signed_url?: string;
};

export type ProjectUpdate = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus | null;
  created_at: string;
  created_by: string | null;
  author_name?: string | null;
  attachments: Attachment[];
};

export type ProjectDetails = ProjectListItem & {
  customer_email: string;
  created_at: string;
  updates: ProjectUpdate[];
};

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_ACTION_STATE: ActionState = { ok: false, message: "" };
