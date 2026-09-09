"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";

export async function createInvitation(formData: FormData) {
  try {
    await requireStaff();
    const adminClient = createSupabaseAdminClient();

    const email = formData.get("email")?.toString().trim();
    const fullName = formData.get("fullName")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const projectIdsStr = formData.get("projectIds")?.toString() || "";
    
    if (!email) throw new Error("E-mail jest wymagany");

    // 1. Sprawdz czy user juz istnieje
    const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
    if (!userError && users.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
      throw new Error("Użytkownik z tym adresem e-mail już istnieje w systemie.");
    }

    // 2. Projekty wybrane do powiązania
    const allEntries = formData.getAll("projectIds").map((s) => s.toString().trim()).filter(Boolean);
    const projectIds = allEntries.flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);

    // 3. Generowanie tokenu i zapisu zaproszenia
    // Zapisujemy wybrane project_ids w zaproszeniu, nie nadpisując danych projektów!
    const { data: invite, error: inviteError } = await adminClient
      .from("invitations")
      .insert({
        email,
        prefilled_data: {
          full_name: fullName,
          phone,
          project_ids: projectIds,
        },
      })
      .select("token")
      .single();

    if (inviteError) {
      if (inviteError.code === "23505") {
        throw new Error("Zaproszenie dla tego e-maila już istnieje i oczekuje na potwierdzenie.");
      }
      throw new Error("Błąd tworzenia zaproszenia.");
    }

    revalidatePath("/panel/uzytkownicy");
    
    return { 
      success: true, 
      token: invite.token,
      message: "Zaproszenie utworzone poprawnie!"
    };

  } catch (err: any) {
    return { success: false, error: err.message || "Wystąpił błąd podczas wysyłania zaproszenia" };
  }
}
