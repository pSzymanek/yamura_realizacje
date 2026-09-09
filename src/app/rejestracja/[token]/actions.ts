"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function completeRegistration(token: string, formData: FormData) {
  try {
    const adminClient = createSupabaseAdminClient();

    // 1. Sprawdzamy zaproszenie
    const { data: invite, error: inviteError } = await adminClient
      .from("invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      throw new Error("Nieprawidłowy token zaproszenia.");
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new Error("To zaproszenie wygasło. Skontaktuj się z nami w celu wygenerowania nowego.");
    }

    const email = invite.email;
    const password = formData.get("password")?.toString();
    const fullName = formData.get("fullName")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";

    if (!password || password.length < 8) {
      throw new Error("Hasło musi mieć co najmniej 8 znaków.");
    }

    // 2. Rejestrujemy użytkownika przez adminClient (auth.admin)
    // Dzięki temu konto jest od razu aktywne (email_confirm: true) i nie zależy od anon key ani SMTP
    let userId: string;

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || undefined,
      },
    });

    if (authError) {
      // Jeśli użytkownik o tym mailu już istnieje w auth.users, zaktualizujmy jego hasło i dane
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("already exists") ||
        authError.message.includes("email_exists")
      ) {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existing = usersData?.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          userId = existing.id;
          await adminClient.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              phone: phone || undefined,
            },
          });
        } else {
          throw new Error("Użytkownik o tym adresie e-mail już istnieje w systemie.");
        }
      } else {
        throw new Error("Błąd podczas tworzenia konta: " + authError.message);
      }
    } else if (!authData.user) {
      throw new Error("Nie udało się utworzyć konta użytkownika.");
    } else {
      userId = authData.user.id;
    }

    // 3. Zaktualizujmy profil w bazie
    await adminClient.from("profiles").upsert({
      id: userId,
      full_name: fullName || null,
      phone: phone || null,
      role: "customer",
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    // 4. Powiązanie wybranych realizacji z kontem klienta
    const prefilled = (invite.prefilled_data as any) || {};
    const projectIds: string[] = prefilled.project_ids || [];
    if (projectIds.length > 0) {
      await adminClient
        .from("projects")
        .update({ customer_user_id: userId })
        .in("id", projectIds);
    }

    // 5. Oznacz zaproszenie jako zużyte (usuwamy je)
    await adminClient.from("invitations").delete().eq("id", invite.id);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Wystąpił błąd podczas rejestracji." };
  }
}
