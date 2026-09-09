import type { ProjectStatus } from "@/lib/statuses";

export type AccountRole = "admin" | "employee" | "customer";
export type StaffRole = Exclude<AccountRole, "customer">;

export type StaffProfile = {
  id: string;
  full_name: string | null;
  role: StaffRole;
  is_active: boolean;
};

export type CustomerProfile = Omit<StaffProfile, "role"> & {
  role: "customer";
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
};

export type ProjectListItem = {
  id: string;
  order_number: string;
  title: string;
  customer_name: string | null;
  customer_email: string | null;
  is_internal?: boolean;
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
  stage?: string | null;
  event_date?: string | null;
  created_at: string;
  created_by: string | null;
  author_name?: string | null;
  attachments: Attachment[];
};

export type ProjectDetails = ProjectListItem & {
  created_at: string;
  updates: ProjectUpdate[];
  priority?: "standard" | "high";
  owner_name?: string;
  next_action?: DemoProjectAction;
  scope?: string;
  events?: DemoCaseEvent[];
  documents?: DemoCaseDocument[];
  quote_versions?: DemoQuoteVersion[];
  participants?: DemoProjectParticipant[];
  checklist?: DemoChecklistItem[];
  internal_notes?: DemoProjectNote[];
  appointments?: DemoAppointment[];
  payments?: DemoPayment[];
  warranty_until?: string | null;
};

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type DemoAdminCustomer = {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city: string;
  status: "active" | "invited" | "inactive";
  registered_at: string;
  last_active: string;
  project_numbers: string[];
  project_ids: string[];
  unread_messages: number;
  invitation_token?: string;
  invitation_expires_at?: string;
  is_invitation_expired?: boolean;
};

export type DemoChatMessage = {
  id: string;
  sender: "customer" | "staff";
  sender_name: string;
  body: string;
  created_at: string;
};

export type DemoConversation = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  project_number: string | null;
  project_title: string | null;
  status: "open" | "closed";
  unread_count: number;
  updated_at: string;
  messages: DemoChatMessage[];
};

export type DemoCaseStage =
  | "inquiry"
  | "quote_preparing"
  | "quote_sent"
  | "quote_accepted"
  | "measurement"
  | "contract"
  | "production"
  | "installation"
  | "completed";

export type DemoCaseEvent = {
  id: string;
  stage: DemoCaseStage;
  title: string;
  description: string;
  date: string;
  actor: string;
  reference: string | null;
};

export type DemoCaseDocument = {
  id: string;
  category: "project" | "quote" | "measurement" | "contract" | "production" | "invoice" | "acceptance";
  name: string;
  number: string;
  date: string;
  status: "received" | "sent" | "accepted" | "signed" | "paid" | "archived";
  version?: number;
  visibility?: "customer" | "internal";
  url?: string;
};

export type DemoProjectAction = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  owner: string;
  audience: "staff" | "customer";
  kind: "follow_up" | "approval" | "measurement" | "contract" | "production" | "installation" | "payment" | "service";
  status: "open" | "completed";
};

export type DemoQuoteVersion = {
  id: string;
  number: string;
  version: number;
  amount_gross: number;
  created_at: string;
  valid_until: string;
  status: "draft" | "sent" | "superseded" | "accepted" | "rejected" | "expired";
};

export type DemoProjectParticipant = {
  id: string;
  name: string;
  role: string;
  email: string;
  access: "staff" | "customer";
};

export type DemoChecklistItem = {
  id: string;
  group: "sprzedaz" | "pomiar" | "dokumentacja" | "produkcja" | "montaz" | "odbior";
  label: string;
  completed: boolean;
};

export type DemoProjectNote = {
  id: string;
  author: string;
  body: string;
  created_at: string;
};

export type DemoAppointment = {
  id: string;
  type: "consultation" | "measurement" | "installation" | "acceptance";
  title: string;
  starts_at: string;
  duration_minutes: number;
  location: string;
  assigned_to: string;
  status: "scheduled" | "completed" | "cancelled";
};

export type DemoPayment = {
  id: string;
  label: string;
  amount: number;
  due_date: string;
  status: "planned" | "due" | "paid";
  document_number: string | null;
};



export const INITIAL_ACTION_STATE: ActionState = { ok: false, message: "" };
