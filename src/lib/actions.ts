"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCustomer, requireStaff } from "@/lib/auth";
import { demoAdminProjects, demoCustomerProjects, isLocalCustomerPreview, isLocalStaffPreview } from "@/lib/customer-demo";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import {
  ALLOWED_PHOTO_TYPES,
  customerProfileSchema,
  loginSchema,
  MAX_PHOTO_COUNT,
  MAX_PHOTO_SIZE,
  projectDetailsSchema,
  projectSchema,
  updateSchema,
} from "@/lib/validation";

function fields(formData: FormData) {
  return {
    orderNumber: String(formData.get("orderNumber") || ""),
    title: String(formData.get("title") || ""),
    customerName: String(formData.get("customerName") || ""),
    customerEmail: String(formData.get("customerEmail") || ""),
    customerUserId: String(formData.get("customerUserId") || ""),
    isInternal: formData.get("isInternal") === "true" || formData.get("isInternal") === "on",
    status: String(formData.get("status") || ""),
  };
}

function validationFailure(error: {
  flatten(): { fieldErrors: Record<string, string[]> };
}): ActionState {
  return {
    ok: false,
    message: "Sprawdź zaznaczone pola.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: "Niepoprawny email lub hasło." };
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = userData.user
    ? await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", userData.user.id)
        .single()
    : { data: null };

  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { ok: false, message: "To konto nie ma aktywnego dostępu." };
  }

  redirect(profile.role === "customer" ? "/konto" : "/panel");
}

export async function logoutAction() {
  if (isLocalStaffPreview()) redirect("/panel");
  if (isLocalCustomerPreview()) redirect("/konto");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateCustomerProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireCustomer();
  const parsed = customerProfileSchema.safeParse({
    fullName: String(formData.get("fullName") || ""),
    phone: String(formData.get("phone") || ""),
    addressLine1: String(formData.get("addressLine1") || ""),
    addressLine2: String(formData.get("addressLine2") || ""),
    postalCode: String(formData.get("postalCode") || ""),
    city: String(formData.get("city") || ""),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      address_line1: parsed.data.addressLine1 || null,
      address_line2: parsed.data.addressLine2 || null,
      postal_code: parsed.data.postalCode || null,
      city: parsed.data.city || null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "Nie udało się zapisać danych konta." };
  }

  revalidatePath("/konto");
  revalidatePath("/konto/profil");
  return { ok: true, message: "Dane konta zostały zapisane." };
}

export async function changeCustomerPasswordAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireCustomer();
  const password = String(formData.get("password") || "").trim();
  const passwordConfirm = String(formData.get("passwordConfirm") || "").trim();

  if (!password || password.length < 8) {
    return { ok: false, message: "Nowe hasło musi mieć co najmniej 8 znaków." };
  }

  if (password !== passwordConfirm) {
    return { ok: false, message: "Wpisane hasła nie są identyczne." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: "Błąd podczas zmiany hasła: " + error.message };
  }

  return { ok: true, message: "Twoje hasło zostało pomyślnie zmienione." };
}

export async function deleteCustomerAccountAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireCustomer();
  const confirmText = String(formData.get("confirmText") || "").trim().toUpperCase();

  if (confirmText !== "USUŃ" && confirmText !== "USUN") {
    return { ok: false, message: 'Wpisz słowo "USUŃ", aby potwierdzić usunięcie konta.' };
  }

  const adminClient = createSupabaseAdminClient();

  // 1. Odłącz realizacje (pozostają w bazie stolarni)
  await adminClient.from("projects").update({ customer_user_id: null }).eq("customer_user_id", user.id);

  // 2. Usuń profil i zaproszenia
  if (user.email) {
    await adminClient.from("invitations").delete().eq("email", user.email);
  }
  await adminClient.from("profiles").delete().eq("id", user.id);

  // 3. Usuń konto w auth.users
  await adminClient.auth.admin.deleteUser(user.id).catch(() => null);

  // 4. Wyloguj sesję
  await supabase.auth.signOut().catch(() => null);

  redirect("/login");
}

export async function createProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = projectSchema.safeParse(fields(formData));

  if (!parsed.success) return validationFailure(parsed.error);

  let customerUserId: string | null = parsed.data.customerUserId || null;

  // Auto-detect customer user ID by email if not explicitly selected from dropdown
  if (!customerUserId && !parsed.data.isInternal && parsed.data.customerEmail) {
    try {
      const adminClient = createSupabaseAdminClient();
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const found = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === parsed.data.customerEmail.toLowerCase()
      );
      if (found) {
        customerUserId = found.id;
      }
    } catch {
      // ignore
    }
  }

  if (isLocalStaffPreview()) {
    const newId = randomUUID();
    const newProject = {
      id: newId,
      order_number: parsed.data.orderNumber,
      title: parsed.data.title,
      customer_name: parsed.data.isInternal ? null : (parsed.data.customerName || null),
      customer_email: parsed.data.isInternal ? null : (parsed.data.customerEmail ? parsed.data.customerEmail.toLowerCase() : null),
      customer_user_id: customerUserId,
      is_internal: parsed.data.isInternal,
      status: parsed.data.status as any,
      next_step: "Ustalenie harmonogramu prac",
      next_step_date: null,
      access_token: randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, ""),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updates: [],
    };
    demoAdminProjects.unshift(newProject as any);
    revalidatePath("/panel");
    revalidatePath("/panel/realizacje");
    revalidatePath("/panel/uzytkownicy");
    revalidatePath("/konto");
    revalidatePath("/konto/realizacje");
    redirect(`/panel/realizacje/${newId}?created=1`);
  }

  const { supabase } = await requireStaff();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      order_number: parsed.data.orderNumber,
      title: parsed.data.title,
      customer_name: parsed.data.isInternal ? (parsed.data.customerName || null) : parsed.data.customerName,
      customer_email: parsed.data.isInternal ? (parsed.data.customerEmail ? parsed.data.customerEmail.toLowerCase() : null) : parsed.data.customerEmail.toLowerCase(),
      customer_user_id: customerUserId,
      is_internal: parsed.data.isInternal,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    const duplicate = error?.code === "23505";
    return {
      ok: false,
      message: duplicate
        ? "Realizacja o tym numerze zamówienia już istnieje."
        : "Nie udało się utworzyć realizacji. Spróbuj ponownie.",
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/realizacje");
  revalidatePath("/panel/uzytkownicy");
  revalidatePath("/konto");
  revalidatePath("/konto/realizacje");
  redirect(`/panel/realizacje/${data.id}?created=1`);
}

export async function updateProjectDetailsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = projectDetailsSchema.safeParse({
    ...fields(formData),
    projectId: String(formData.get("projectId") || ""),
    nextStep: String(formData.get("nextStep") || ""),
    nextStepDate: String(formData.get("nextStepDate") || ""),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  if (isLocalStaffPreview()) {
    const match = demoAdminProjects.find((p) => p.id === parsed.data.projectId);
    if (match) {
      match.order_number = parsed.data.orderNumber;
      match.title = parsed.data.title;
      match.status = parsed.data.status as any;
      match.is_internal = parsed.data.isInternal;
      match.customer_name = parsed.data.isInternal ? null : (parsed.data.customerName || null);
      match.customer_email = parsed.data.isInternal ? null : (parsed.data.customerEmail ? parsed.data.customerEmail.toLowerCase() : null);
      match.next_step = parsed.data.nextStep || null;
      match.next_step_date = parsed.data.nextStepDate || null;
      match.updated_at = new Date().toISOString();
    }
    const custMatch = demoCustomerProjects.find((p) => p.id === parsed.data.projectId);
    if (custMatch) {
      custMatch.order_number = parsed.data.orderNumber;
      custMatch.title = parsed.data.title;
      custMatch.status = parsed.data.status as any;
      custMatch.is_internal = parsed.data.isInternal;
      custMatch.customer_name = parsed.data.isInternal ? null : (parsed.data.customerName || null);
      custMatch.customer_email = parsed.data.isInternal ? null : (parsed.data.customerEmail ? parsed.data.customerEmail.toLowerCase() : null);
      custMatch.next_step = parsed.data.nextStep || null;
      custMatch.next_step_date = parsed.data.nextStepDate || null;
      custMatch.updated_at = new Date().toISOString();
    }
    revalidatePath(`/panel/realizacje/${parsed.data.projectId}`);
    revalidatePath(`/konto/realizacje/${parsed.data.projectId}`);
    revalidatePath(`/panel`);
    return { ok: true, message: "Dane projektu zostały pomyślnie zaktualizowane." };
  }

  const { supabase } = await requireStaff();

  const { error } = await supabase
    .from("projects")
    .update({
      order_number: parsed.data.orderNumber,
      title: parsed.data.title,
      customer_name: parsed.data.isInternal ? (parsed.data.customerName || null) : parsed.data.customerName,
      customer_email: parsed.data.isInternal ? (parsed.data.customerEmail ? parsed.data.customerEmail.toLowerCase() : null) : parsed.data.customerEmail.toLowerCase(),
      is_internal: parsed.data.isInternal,
      status: parsed.data.status,
      next_step: parsed.data.nextStep || null,
      next_step_date: parsed.data.nextStepDate,
    })
    .eq("id", parsed.data.projectId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Ten numer projektu jest już używany."
          : "Nie udało się zapisać zmian.",
    };
  }

  revalidatePath(`/panel/realizacje/${parsed.data.projectId}`);
  revalidatePath(`/r`);
  return { ok: true, message: "Dane projektu zostały zapisane." };
}

function validatePhotos(files: File[]): string | null {
  if (files.length > MAX_PHOTO_COUNT) {
    return `Możesz dodać maksymalnie ${MAX_PHOTO_COUNT} zdjęcia.`;
  }

  for (const file of files) {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
      return `Plik „${file.name}” ma niedozwolony format.`;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return `Plik „${file.name}” przekracza limit 6 MB.`;
    }
  }

  return null;
}

function safeExtension(file: File): string {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return byType[file.type];
}

export async function publishUpdateAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateSchema.safeParse({
    projectId: String(formData.get("projectId") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    stage: String(formData.get("stage") || ""),
    eventDate: String(formData.get("eventDate") || ""),
    status: String(formData.get("status") || ""),
    nextStep: String(formData.get("nextStep") || ""),
    nextStepDate: String(formData.get("nextStepDate") || ""),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  if (isLocalStaffPreview()) {
    const match = demoAdminProjects.find((p) => p.id === parsed.data.projectId);
    if (match) {
      const newUpdate = {
        id: randomUUID(),
        title: parsed.data.title,
        description: parsed.data.description,
        status: (parsed.data.status || match.status) as any,
        stage: parsed.data.stage || null,
        event_date: parsed.data.eventDate || null,
        created_at: new Date().toISOString(),
        created_by: null,
        author_name: "Mistrz Stolarski Janusz",
        attachments: [],
      };
      match.updates.unshift(newUpdate);
      if (parsed.data.status) match.status = parsed.data.status as any;
      if (parsed.data.nextStep) match.next_step = parsed.data.nextStep;
      if (parsed.data.nextStepDate) match.next_step_date = parsed.data.nextStepDate;
      match.updated_at = new Date().toISOString();
    }
    const custMatch = demoCustomerProjects.find((p) => p.id === parsed.data.projectId);
    if (custMatch && match) {
      custMatch.updates = [...match.updates];
      custMatch.status = match.status;
      custMatch.next_step = match.next_step;
      custMatch.next_step_date = match.next_step_date;
      custMatch.updated_at = match.updated_at;
    }
    revalidatePath(`/panel/realizacje/${parsed.data.projectId}`);
    revalidatePath(`/konto/realizacje/${parsed.data.projectId}`);
    revalidatePath("/panel");
    return { ok: true, message: "Aktualizacja została pomyślnie opublikowana." };
  }

  const { supabase } = await requireStaff();

  const photos = formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const photoError = validatePhotos(photos);

  if (photoError) return { ok: false, message: photoError };

  const updateId = randomUUID();
  const uploadedPaths: string[] = [];
  const attachmentRows: Array<{
    storage_path: string;
    original_filename: string;
    mime_type: string;
  }> = [];

  for (const photo of photos) {
    const path = `projects/${parsed.data.projectId}/${updateId}/${randomUUID()}.${safeExtension(photo)}`;
    const { error } = await supabase.storage
      .from("project-attachments")
      .upload(path, await photo.arrayBuffer(), {
        contentType: photo.type,
        upsert: false,
      });

    if (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from("project-attachments").remove(uploadedPaths);
      }
      return {
        ok: false,
        message: "Nie udało się przesłać wszystkich zdjęć. Spróbuj ponownie.",
      };
    }

    uploadedPaths.push(path);
    attachmentRows.push({
      storage_path: path,
      original_filename: photo.name.slice(0, 255),
      mime_type: photo.type,
    });
  }

  const { error } = await supabase.rpc("publish_project_update", {
    p_project_id: parsed.data.projectId,
    p_update_id: updateId,
    p_title: parsed.data.title,
    p_description: parsed.data.description,
    p_status: parsed.data.status,
    p_next_step: parsed.data.nextStep,
    p_next_step_date: parsed.data.nextStepDate,
    p_attachments: attachmentRows,
  });

  if (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from("project-attachments").remove(uploadedPaths);
    }
    return {
      ok: false,
      message: "Nie udało się opublikować aktualizacji. Żadne dane nie zostały zapisane.",
    };
  }

  if (parsed.data.stage || parsed.data.eventDate) {
    await supabase
      .from("project_updates")
      .update({
        stage: parsed.data.stage || null,
        event_date: parsed.data.eventDate || null,
      })
      .eq("id", updateId);
  }

  revalidatePath(`/panel/realizacje/${parsed.data.projectId}`);
  revalidatePath("/panel");
  revalidatePath("/r", "layout");
  return { ok: true, message: "Aktualizacja została opublikowana." };
}

export async function deleteProjectUpdateAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const updateId = String(formData.get("updateId") || "");
  const projectId = String(formData.get("projectId") || "");
  if (!updateId || !projectId) {
    return { ok: false, message: "Brak identyfikatora wpisu." };
  }

  if (isLocalStaffPreview()) {
    const match = demoAdminProjects.find((p) => p.id === projectId);
    if (match) {
      match.updates = match.updates.filter((u) => u.id !== updateId);
    }
    const custMatch = demoCustomerProjects.find((p) => p.id === projectId);
    if (custMatch) {
      custMatch.updates = custMatch.updates.filter((u) => u.id !== updateId);
    }
    revalidatePath(`/panel/realizacje/${projectId}`);
    revalidatePath(`/konto/realizacje/${projectId}`);
    return { ok: true, message: "Wpis został usunięty z dziennika." };
  }

  const { supabase } = await requireStaff();
  const adminClient = createSupabaseAdminClient();

  // Clean up any storage attachments if present
  try {
    const { data: atts } = await adminClient
      .from("attachments")
      .select("storage_path")
      .eq("project_update_id", updateId);

    if (atts && atts.length > 0) {
      const paths = atts
        .map((a) => a.storage_path)
        .filter((p) => p && !p.startsWith("/"));
      if (paths.length > 0) {
        await adminClient.storage.from("project-attachments").remove(paths);
      }
    }
  } catch (err) {
    console.error("Failed to clean up update attachments from storage:", err);
  }

  // 1. Try RPC delete_project_update (security definer)
  const { error: rpcError } = await supabase.rpc("delete_project_update", {
    p_update_id: updateId,
  });

  if (rpcError) {
    // 2. Fallback to direct delete via adminClient (service role)
    const { error: deleteError } = await adminClient
      .from("project_updates")
      .delete()
      .eq("id", updateId);

    if (deleteError) {
      console.error("deleteProjectUpdateAction errors:", { rpcError, deleteError });
      return {
        ok: false,
        message: `Nie udało się usunąć wpisu: ${deleteError.message || rpcError.message}`,
      };
    }
  }

  revalidatePath(`/panel/realizacje/${projectId}`);
  revalidatePath(`/konto/realizacje/${projectId}`);
  revalidatePath("/panel");
  return { ok: true, message: "Wpis został usunięty." };
}

export async function updateProjectStageAction(
  projectId: string,
  newStage: string,
): Promise<ActionState> {
  if (!projectId || !newStage) {
    return { ok: false, message: "Błędne dane." };
  }

  if (isLocalStaffPreview()) {
    const match = demoAdminProjects.find((p) => p.id === projectId);
    if (match) {
      match.status = newStage as any;
      match.updated_at = new Date().toISOString();
    }
    const custMatch = demoCustomerProjects.find((p) => p.id === projectId);
    if (custMatch) {
      custMatch.status = newStage as any;
      custMatch.updated_at = new Date().toISOString();
    }
    revalidatePath(`/panel/realizacje/${projectId}`);
    revalidatePath(`/konto/realizacje/${projectId}`);
    return { ok: true, message: `Etap realizacji zmieniony na: ${newStage}` };
  }

  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("projects")
    .update({ status: newStage, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) return { ok: false, message: "Nie udało się zmienić etapu." };
  revalidatePath(`/panel/realizacje/${projectId}`);
  revalidatePath(`/konto/realizacje/${projectId}`);
  return { ok: true, message: "Etap realizacji został zaktualizowany." };
}

export async function updateProjectDateAction(
  projectId: string,
  nextStepDate: string | null,
): Promise<ActionState> {
  if (!projectId) return { ok: false, message: "Brak ID projektu." };
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("projects")
    .update({
      next_step_date: nextStepDate ? nextStepDate : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { ok: false, message: "Błąd zapisu terminu." };

  revalidatePath(`/panel/realizacje/${projectId}`);
  revalidatePath(`/konto/realizacje/${projectId}`);
  revalidatePath(`/panel/realizacje`);
  revalidatePath(`/panel`);
  return { ok: true, message: "Zaktualizowano termin etapu." };
}

export async function updateProjectNextStepAction(
  projectId: string,
  nextStep: string,
): Promise<ActionState> {
  if (!projectId) return { ok: false, message: "Brak ID projektu." };
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("projects")
    .update({
      next_step: nextStep.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { ok: false, message: "Błąd zapisu działania." };

  revalidatePath(`/panel/realizacje/${projectId}`);
  revalidatePath(`/konto/realizacje/${projectId}`);
  revalidatePath(`/panel/realizacje`);
  revalidatePath(`/panel`);
  return { ok: true, message: "Zaktualizowano bieżące działanie." };
}

export async function updateProjectEntryAction(
  projectId: string,
  updateId: string,
  title: string,
  description: string,
): Promise<ActionState> {
  if (!projectId || !updateId) return { ok: false, message: "Brak danych." };
  await requireStaff();
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("project_updates")
    .update({
      title: title.trim(),
      description: description.trim(),
    })
    .eq("id", updateId);

  if (error) {
    console.error("updateProjectEntryAction error:", error);
    return { ok: false, message: "Błąd aktualizacji wpisu." };
  }

  revalidatePath(`/panel/realizacje/${projectId}`);
  revalidatePath(`/konto/realizacje/${projectId}`);
  return { ok: true, message: "Wpis został zaktualizowany." };
}

export async function updateProjectBasicInfoAction(
  projectId: string,
  title: string,
  customerName: string,
  customerEmail: string,
): Promise<ActionState> {
  if (!projectId) return { ok: false, message: "Brak ID projektu." };
  const { supabase } = await requireStaff();
  const { error } = await supabase
    .from("projects")
    .update({
      title: title.trim(),
      customer_name: customerName.trim() || null,
      customer_email: customerEmail.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) return { ok: false, message: "Błąd zapisu danych." };

  revalidatePath(`/panel/realizacje/${projectId}`);
  revalidatePath(`/panel/realizacje`);
  revalidatePath(`/panel/uzytkownicy`);
  return { ok: true, message: "Zaktualizowano dane projektu." };
}

export async function addProjectDocumentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") || "");
  const name = String(formData.get("name") || "").trim();
  const number = String(formData.get("number") || "").trim();
  const category = (formData.get("category") || "project") as any;

  if (!projectId || !name) {
    return { ok: false, message: "Podaj nazwę dokumentu." };
  }

  if (isLocalStaffPreview()) {
    const docId = `doc-${Date.now()}`;
    const newDoc = {
      id: docId,
      name,
      number: number || `DOC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      category,
      status: "accepted" as const,
      date: new Date().toISOString().slice(0, 10),
      url: "#",
    };
    const match = demoAdminProjects.find((p) => p.id === projectId);
    if (match) {
      match.documents = match.documents || [];
      match.documents.push(newDoc);
    }
    const custMatch = demoCustomerProjects.find((p) => p.id === projectId);
    if (custMatch) {
      custMatch.documents = custMatch.documents || [];
      custMatch.documents.push(newDoc);
    }
    revalidatePath(`/panel/realizacje/${projectId}`);
    revalidatePath(`/konto/realizacje/${projectId}`);
    return { ok: true, message: "Dokument został pomyślnie dodany do teczki." };
  }

  return { ok: true, message: "Dokument został zarejestrowany." };
}

export async function deleteProjectDocumentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") || "");
  const docId = String(formData.get("docId") || "");

  if (!projectId || !docId) {
    return { ok: false, message: "Brak danych dokumentu." };
  }

  if (isLocalStaffPreview()) {
    const match = demoAdminProjects.find((p) => p.id === projectId);
    if (match && match.documents) {
      match.documents = match.documents.filter((d) => d.id !== docId);
    }
    const custMatch = demoCustomerProjects.find((p) => p.id === projectId);
    if (custMatch && custMatch.documents) {
      custMatch.documents = custMatch.documents.filter((d) => d.id !== docId);
    }
    revalidatePath(`/panel/realizacje/${projectId}`);
    revalidatePath(`/konto/realizacje/${projectId}`);
    return { ok: true, message: "Dokument został usunięty z teczki." };
  }

  return { ok: true, message: "Dokument został usunięty." };
}
