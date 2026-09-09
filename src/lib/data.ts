import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireCustomer, requireStaff } from "@/lib/auth";
import {
  demoCustomerProjects,
  demoAdminProjects,
  isLocalCustomerPreview,
  isLocalStaffPreview,
} from "@/lib/customer-demo";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Attachment,
  DemoAdminCustomer,
  ProjectDetails,
  ProjectListItem,
  ProjectUpdate,
} from "@/lib/types";

type RawUpdate = Omit<ProjectUpdate, "attachments"> & {
  attachments: Attachment[] | null;
  stage?: string | null;
  event_date?: string | null;
};

type RawProject = Omit<ProjectDetails, "updates"> & {
  is_internal?: boolean;
  project_updates: RawUpdate[] | null;
};

async function addSignedUrls(
  project: RawProject,
  storageClient?: SupabaseClient,
): Promise<ProjectDetails> {
  const client = storageClient || createSupabaseAdminClient();
  const updates = await Promise.all(
    (project.project_updates || []).map(async (update) => {
      const attachments = await Promise.all(
        (update.attachments || []).map(async (attachment) => {
          if (
            attachment.storage_path.startsWith("/") ||
            attachment.storage_path.startsWith("http://") ||
            attachment.storage_path.startsWith("https://")
          ) {
            return { ...attachment, signed_url: attachment.storage_path };
          }
          const { data } = await client.storage
            .from("project-attachments")
            .createSignedUrl(attachment.storage_path, 600);
          return { ...attachment, signed_url: data?.signedUrl };
        }),
      );
      return {
        ...update,
        stage: update.stage ?? null,
        event_date: update.event_date ?? null,
        attachments,
      };
    }),
  );

  const existingDocs = (project as any).documents || [];
  const documents = existingDocs.length
    ? existingDocs
    : updates.flatMap((u) =>
        u.attachments.map((att) => ({
          id: att.id,
          name: att.original_filename.replace(/\.[^/.]+$/, ""),
          number: `WYC/${project.order_number.replace("YAM/", "")}`,
          category: "quote" as const,
          status: "accepted" as const,
          date: att.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          url: att.signed_url || att.storage_path,
        }))
      );

  return {
    id: project.id,
    order_number: project.order_number,
    title: project.title,
    customer_name: project.customer_name,
    customer_email: project.customer_email,
    is_internal: Boolean(project.is_internal),
    status: project.status,
    next_step: project.next_step,
    next_step_date: project.next_step_date,
    access_token: project.access_token,
    created_at: project.created_at,
    updated_at: project.updated_at,
    updates,
    documents,
  };
}

const PROJECT_DETAILS_SELECT = `
  id,
  order_number,
  title,
  customer_name,
  customer_email,
  is_internal,
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
    stage,
    event_date,
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
  if (isLocalStaffPreview()) return demoAdminProjects;
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, order_number, title, customer_name, customer_email, is_internal, status, next_step, next_step_date, access_token, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Nie udało się pobrać realizacji.");
  return (data || []) as ProjectListItem[];
}

export async function getUnassignedProjects(): Promise<ProjectListItem[]> {
  if (isLocalStaffPreview()) return demoAdminProjects.filter(p => !p.is_internal && !p.customer_email);
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("projects")
    .select("id, order_number, title, customer_name, customer_email, is_internal, status, next_step, next_step_date, access_token, updated_at")
    .eq("is_internal", false)
    .is("customer_user_id", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Nie udało się pobrać projektów bez klienta.");
  return (data || []) as ProjectListItem[];
}

export async function getStaffProject(id: string): Promise<ProjectDetails | null> {
  if (isLocalStaffPreview()) {
    return demoAdminProjects.find((project) => project.id === id) || null;
  }
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
  const query = token.trim().toLowerCase();

  if (isLocalCustomerPreview() || isLocalStaffPreview()) {
    const match = demoAdminProjects.find(
      (p) =>
        p.access_token.toLowerCase() === query ||
        p.order_number.toLowerCase() === query ||
        p.id === token,
    );
    if (match) {
      if (match.is_internal) return null;
      return match;
    }
  }

  if (!/^[0-9a-f]{64}$/.test(token)) return null;

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("projects")
      .select(PROJECT_DETAILS_SELECT)
      .eq("access_token", token)
      .order("created_at", { referencedTable: "project_updates", ascending: false })
      .single();

    if (error || !data) return null;
    return addSignedUrls(data as unknown as RawProject);
  } catch {
    return null;
  }
}

export async function getActiveClientProjects(): Promise<
  Array<{ orderNumber: string; title: string; token: string; status: string }>
> {
  const all = demoAdminProjects.filter((p) => !p.is_internal && p.status !== "completed");
  return all.map((p) => ({
    orderNumber: p.order_number,
    title: p.title,
    token: p.access_token,
    status: p.status,
  }));
}


export async function getCustomerProjects(): Promise<ProjectDetails[]> {
  if (isLocalCustomerPreview()) return demoCustomerProjects;
  const { supabase, user } = await requireCustomer();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAILS_SELECT)
    .eq("customer_user_id", user.id)
    .order("updated_at", { ascending: false })
    .order("created_at", { referencedTable: "project_updates", ascending: false });

  if (error) throw new Error("Nie udało się pobrać realizacji klienta.");

  return Promise.all(
    (data || []).map((project) =>
      addSignedUrls(project as unknown as RawProject, supabase),
    ),
  );
}

export async function getCustomerProject(id: string): Promise<ProjectDetails | null> {
  if (isLocalCustomerPreview()) {
    return demoCustomerProjects.find((project) => project.id === id) || null;
  }
  const { supabase, user } = await requireCustomer();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAILS_SELECT)
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .order("created_at", { referencedTable: "project_updates", ascending: false })
    .single();

  if (error || !data) return null;
  return addSignedUrls(data as unknown as RawProject, supabase);
}

export async function getStaffCustomers(): Promise<DemoAdminCustomer[]> {
  try {
    const { user: currentStaff } = await requireStaff();
    const adminClient = createSupabaseAdminClient();

    const [profilesRes, projectsRes, invitesRes, authUsersRes] = await Promise.all([
      adminClient
        .from("profiles")
        .select("id, full_name, role, is_active, phone, address_line1, address_line2, postal_code, city, created_at, updated_at"),
      adminClient
        .from("projects")
        .select("id, order_number, title, customer_name, customer_email, customer_user_id, updated_at")
        .order("updated_at", { ascending: false }),
      adminClient
        .from("invitations")
        .select("id, email, token, prefilled_data, expires_at, created_at"),
      adminClient.auth.admin.listUsers({ perPage: 1000 }).catch(() => ({ data: { users: [] } })),
    ]);

    const profiles = profilesRes.data || [];
    const projects = projectsRes.data || [];
    const invitations = invitesRes.data || [];
    const authUsers = (authUsersRes as any)?.data?.users || [];

    const profileMap = new Map<string, any>();
    for (const p of profiles) {
      profileMap.set(p.id, p);
    }

    const customerMap = new Map<string, DemoAdminCustomer>();

    // 1. Przetwórz wszystkich użytkowników z auth.users (poza personelem/adminem)
    for (const u of authUsers) {
      const emailLower = (u.email || "").toLowerCase();
      // Pomiń główne konto administracyjne stolarni
      if (emailLower === "biuro@yamura.pl" || u.id === currentStaff.id) {
        continue;
      }

      let prof = profileMap.get(u.id);

      // Jeśli użytkownik ma rolę 'admin', to jest personelem - pomiń
      if (prof?.role === "admin") {
        continue;
      }

      // Jeśli profil nie istnieje lub rola to nie 'customer', napraw profil w bazie
      if (!prof || prof.role !== "customer") {
        const resolvedName = prof?.full_name || u.user_metadata?.full_name || u.email?.split("@")[0] || "Klient";
        const resolvedPhone = prof?.phone || u.user_metadata?.phone || null;

        try {
          await adminClient
            .from("profiles")
            .upsert({
              id: u.id,
              full_name: resolvedName,
              phone: resolvedPhone,
              role: "customer",
              is_active: true,
            });
        } catch {
          // ignore
        }

        prof = {
          id: u.id,
          full_name: resolvedName,
          phone: resolvedPhone,
          role: "customer",
          is_active: true,
          created_at: prof?.created_at || u.created_at,
          ...prof,
        };
      }

      const custProjects = projects.filter(
        (p) => p.customer_user_id === u.id || (p.customer_email && p.customer_email.toLowerCase() === emailLower)
      );

      // Sprawdź czy istnieje zaproszenie dla tego e-maila
      const pendingInvite = invitations.find(
        (i) => i.email.toLowerCase() === emailLower
      );

      customerMap.set(u.id, {
        id: u.id,
        auth_user_id: u.id,
        full_name: prof.full_name || u.user_metadata?.full_name || "Klient",
        email: u.email || "—",
        phone: prof.phone || u.user_metadata?.phone || "—",
        address: [prof.address_line1, prof.address_line2].filter(Boolean).join(" ") || "—",
        address_line1: prof.address_line1 || "",
        address_line2: prof.address_line2 || "",
        postal_code: prof.postal_code || "",
        city: prof.city || "—",
        status: prof.is_active === false ? "inactive" : "active",
        registered_at: prof.created_at || u.created_at,
        last_active: u.last_sign_in_at ? "Aktywny" : "Nowe konto",
        project_numbers: custProjects.map((p) => p.order_number),
        project_ids: custProjects.map((p) => p.id),
        unread_messages: 0,
        invitation_token: pendingInvite?.token,
        invitation_expires_at: pendingInvite?.expires_at,
        is_invitation_expired: pendingInvite ? new Date(pendingInvite.expires_at) < new Date() : false,
      });
    }

    // 2. Oczekujące zaproszenia (dla osób, które jeszcze nie mają konta w auth.users)
    for (const inv of invitations) {
      const emailKey = inv.email.toLowerCase();
      const alreadyInMap = Array.from(customerMap.values()).find(
        (c) => c.email.toLowerCase() === emailKey
      );

      if (!alreadyInMap) {
        const prefilled = (inv.prefilled_data as any) || {};
        const projectIds: string[] = prefilled.project_ids || [];
        const custProjects = projects.filter(
          (p) => projectIds.includes(p.id) || (p.customer_email && p.customer_email.toLowerCase() === emailKey)
        );

        customerMap.set(inv.id, {
          id: inv.id,
          full_name: prefilled.full_name || inv.email,
          email: inv.email,
          phone: prefilled.phone || "—",
          address: "—",
          address_line1: prefilled.address_line1 || "",
          address_line2: prefilled.address_line2 || "",
          postal_code: prefilled.postal_code || "",
          city: prefilled.city || "—",
          status: "invited",
          registered_at: inv.created_at,
          last_active: "Zaproszenie wysłane",
          project_numbers: custProjects.map((p) => p.order_number),
          project_ids: custProjects.map((p) => p.id),
          unread_messages: 0,
          invitation_token: inv.token,
          invitation_expires_at: inv.expires_at,
          is_invitation_expired: new Date(inv.expires_at) < new Date(),
        });
      }
    }

    return Array.from(customerMap.values());
  } catch (err) {
    console.error("Error in getStaffCustomers:", err);
    return [];
  }
}
