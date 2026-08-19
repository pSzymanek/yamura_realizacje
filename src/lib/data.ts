import "server-only";

import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Attachment,
  ProjectDetails,
  ProjectListItem,
  ProjectUpdate,
} from "@/lib/types";

type RawUpdate = Omit<ProjectUpdate, "attachments"> & {
  attachments: Attachment[] | null;
};

type RawProject = Omit<ProjectDetails, "updates"> & {
  project_updates: RawUpdate[] | null;
};

async function addSignedUrls(project: RawProject): Promise<ProjectDetails> {
  const admin = createSupabaseAdminClient();
  const updates = await Promise.all(
    (project.project_updates || []).map(async (update) => {
      const attachments = await Promise.all(
        (update.attachments || []).map(async (attachment) => {
          const { data } = await admin.storage
            .from("project-attachments")
            .createSignedUrl(attachment.storage_path, 600);
          return { ...attachment, signed_url: data?.signedUrl };
        }),
      );
      return { ...update, attachments };
    }),
  );

  return {
    id: project.id,
    order_number: project.order_number,
    title: project.title,
    customer_name: project.customer_name,
    customer_email: project.customer_email,
    status: project.status,
    next_step: project.next_step,
    next_step_date: project.next_step_date,
    access_token: project.access_token,
    created_at: project.created_at,
    updated_at: project.updated_at,
    updates,
  };
}

const PROJECT_DETAILS_SELECT = `
  id,
  order_number,
  title,
  customer_name,
  customer_email,
  status,
  next_step,
  next_step_date,
  access_token,
  created_at,
  updated_at,
  project_updates (
    id,
    title,
    description,
    status,
    created_at,
    created_by,
    attachments (
      id,
      storage_path,
      original_filename,
      mime_type,
      created_at
    )
  )
`;

export async function getProjects(): Promise<ProjectListItem[]> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, order_number, title, customer_name, status, next_step, next_step_date, access_token, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Nie udało się pobrać realizacji.");
  return (data || []) as ProjectListItem[];
}

export async function getStaffProject(id: string): Promise<ProjectDetails | null> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAILS_SELECT)
    .eq("id", id)
    .order("created_at", { referencedTable: "project_updates", ascending: false })
    .single();

  if (error || !data) return null;
  return addSignedUrls(data as unknown as RawProject);
}

export async function getClientProject(token: string): Promise<ProjectDetails | null> {
  if (!/^[0-9a-f]{64}$/.test(token)) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select(PROJECT_DETAILS_SELECT)
    .eq("access_token", token)
    .order("created_at", { referencedTable: "project_updates", ascending: false })
    .single();

  if (error || !data) return null;
  return addSignedUrls(data as unknown as RawProject);
}
