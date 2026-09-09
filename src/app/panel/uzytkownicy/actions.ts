"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";

export type UpdateCustomerPayload = {
  id: string;
  status: "active" | "invited" | "inactive";
  fullName: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  newPassword?: string;
  projectIds: string[];
};

export async function updateCustomerAction(payload: UpdateCustomerPayload) {
  try {
    await requireStaff();
    const adminClient = createSupabaseAdminClient();

    const {
      id,
      status,
      fullName,
      email,
      phone,
      address_line1,
      address_line2,
      postal_code,
      city,
      newPassword,
      projectIds,
    } = payload;

    if (!email || !email.includes("@")) {
      throw new Error("Podaj prawidłowy adres e-mail.");
    }

    if (status === "invited") {
      // 1. Aktualizacja oczekującego zaproszenia
      const { error: inviteErr } = await adminClient
        .from("invitations")
        .update({
          email: email.trim().toLowerCase(),
          prefilled_data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            address_line1: address_line1.trim(),
            address_line2: address_line2.trim(),
            postal_code: postal_code.trim(),
            city: city.trim(),
            project_ids: projectIds,
          },
        })
        .eq("id", id);

      if (inviteErr) {
        throw new Error("Błąd podczas aktualizacji zaproszenia: " + inviteErr.message);
      }

      // Jeśli administrator podał nowe hasło dla zaproszonego, możemy od razu aktywować konto
      if (newPassword && newPassword.trim().length >= 8) {
        const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password: newPassword.trim(),
          email_confirm: true,
          user_metadata: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        });

        if (authErr) {
          throw new Error("Błąd tworzenia konta: " + authErr.message);
        }

        if (authData.user) {
          await adminClient.from("profiles").upsert({
            id: authData.user.id,
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
            address_line1: address_line1.trim() || null,
            address_line2: address_line2.trim() || null,
            postal_code: postal_code.trim() || null,
            city: city.trim() || null,
            role: "customer",
            is_active: true,
            updated_at: new Date().toISOString(),
          });

          if (projectIds.length > 0) {
            await adminClient
              .from("projects")
              .update({ customer_user_id: authData.user.id })
              .in("id", projectIds);
          }

          // Usuń zużyte zaproszenie
          await adminClient.from("invitations").delete().eq("id", id);
        }
      }
    } else {
      // 2. Aktualizacja zarejestrowanego użytkownika (status === "active" | "inactive")
      // A. Aktualizacja w Supabase Auth (email, metadane, hasło)
      const authUpdates: {
        email?: string;
        password?: string;
        user_metadata?: Record<string, any>;
      } = {
        email: email.trim().toLowerCase(),
        user_metadata: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          address_line1: address_line1.trim(),
          address_line2: address_line2.trim(),
          postal_code: postal_code.trim(),
          city: city.trim(),
        },
      };

      if (newPassword && newPassword.trim().length >= 8) {
        authUpdates.password = newPassword.trim();
      }

      const { error: authErr } = await adminClient.auth.admin.updateUserById(id, authUpdates);
      if (authErr) {
        throw new Error("Błąd aktualizacji konta logowania: " + authErr.message);
      }

      // B. Aktualizacja w tabeli profiles (zabezpieczona przed przerwaniem całego procesu)
      const { error: profErr } = await adminClient
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          address_line1: address_line1.trim() || null,
          address_line2: address_line2.trim() || null,
          postal_code: postal_code.trim() || null,
          city: city.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (profErr) {
        console.warn("Ostrzeżenie przy zapisie w profiles (sprawdź uprawnienia tabeli w Supabase):", profErr.message);
      }

      // C. Aktualizacja powiązanych projektów (podpinanie/odpinanie)
      const { data: currentProjects } = await adminClient
        .from("projects")
        .select("id")
        .eq("customer_user_id", id);

      const currentIds = (currentProjects || []).map((p) => p.id);
      const toUnlink = currentIds.filter((pId) => !projectIds.includes(pId));

      if (toUnlink.length > 0) {
        const { error: unlinkErr } = await adminClient
          .from("projects")
          .update({ customer_user_id: null })
          .in("id", toUnlink);
        if (unlinkErr) {
          throw new Error("Błąd odłączania projektów: " + unlinkErr.message);
        }
      }

      if (projectIds.length > 0) {
        const { error: linkErr } = await adminClient
          .from("projects")
          .update({ customer_user_id: id })
          .in("id", projectIds);
        if (linkErr) {
          throw new Error("Błąd przypisywania projektów: " + linkErr.message);
        }
      }
    }

    revalidatePath("/panel/uzytkownicy");
    revalidatePath("/panel/realizacje");
    revalidatePath("/panel");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Wystąpił nieoczekiwany błąd podczas zapisu." };
  }
}

export async function deleteCustomerAction(id: string, status: string, email: string) {
  try {
    await requireStaff();
    const adminClient = createSupabaseAdminClient();

    // 1. Odłącz realizacje od tego użytkownika (nie usuwamy samych realizacji!)
    await adminClient
      .from("projects")
      .update({ customer_user_id: null })
      .eq("customer_user_id", id);

    // 2. Usuń ewentualne zaproszenia powiązane z tym mailem lub id
    await adminClient
      .from("invitations")
      .delete()
      .or(`id.eq.${id},email.ilike.${email.trim()}`);

    // 3. Usuń profil użytkownika
    await adminClient.from("profiles").delete().eq("id", id);

    // 4. Usuń użytkownika z auth.users
    await adminClient.auth.admin.deleteUser(id).catch(() => null);

    revalidatePath("/panel/uzytkownicy");
    revalidatePath("/panel/realizacje");
    revalidatePath("/panel");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Wystąpił błąd podczas usuwania użytkownika." };
  }
}

export async function regenerateInvitationAction(invitationId: string) {
  try {
    await requireStaff();
    const adminClient = createSupabaseAdminClient();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await adminClient
      .from("invitations")
      .update({
        expires_at: expiresAt,
      })
      .eq("id", invitationId)
      .select("token, expires_at")
      .single();

    if (error || !data) {
      throw new Error("Nie udało się odświeżyć zaproszenia.");
    }

    revalidatePath("/panel/uzytkownicy");

    return {
      success: true,
      token: data.token,
      expires_at: data.expires_at,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Wystąpił błąd podczas odświeżania zaproszenia." };
  }
}
