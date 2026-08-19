"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import {
  ALLOWED_PHOTO_TYPES,
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

  redirect("/panel");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createProjectAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = projectSchema.safeParse(fields(formData));

  if (!parsed.success) return validationFailure(parsed.error);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      order_number: parsed.data.orderNumber,
      title: parsed.data.title,
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail.toLowerCase(),
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
  redirect(`/panel/realizacje/${data.id}?created=1`);
}

export async function updateProjectDetailsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const parsed = projectDetailsSchema.safeParse({
    ...fields(formData),
    projectId: String(formData.get("projectId") || ""),
    nextStep: String(formData.get("nextStep") || ""),
    nextStepDate: String(formData.get("nextStepDate") || ""),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { error } = await supabase
    .from("projects")
    .update({
      order_number: parsed.data.orderNumber,
      title: parsed.data.title,
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail.toLowerCase(),
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
          ? "Ten numer zamówienia jest już używany."
          : "Nie udało się zapisać zmian.",
    };
  }

  revalidatePath(`/panel/realizacje/${parsed.data.projectId}`);
  revalidatePath(`/r`);
  return { ok: true, message: "Dane realizacji zostały zapisane." };
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
  const { supabase } = await requireStaff();
  const parsed = updateSchema.safeParse({
    projectId: String(formData.get("projectId") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    status: String(formData.get("status") || ""),
    nextStep: String(formData.get("nextStep") || ""),
    nextStepDate: String(formData.get("nextStepDate") || ""),
  });

  if (!parsed.success) return validationFailure(parsed.error);

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

  revalidatePath(`/panel/realizacje/${parsed.data.projectId}`);
  revalidatePath("/panel");
  revalidatePath("/r", "layout");
  return { ok: true, message: "Aktualizacja została opublikowana." };
}
