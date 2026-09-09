import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerProfile, StaffProfile } from "@/lib/types";

const PROFILE_SELECT =
  "id, full_name, role, is_active, phone, address_line1, address_line2, postal_code, city";

export const requireStaff = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", authData.user.id)
    .single();

  if (
    profileError ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "employee") ||
    !profile.is_active
  ) {
    redirect("/login");
  }

  return { supabase, user: authData.user, profile: profile as StaffProfile };
});

export const requireCustomer = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    redirect("/login");
  }

  if (profile.role !== "customer") {
    redirect("/panel");
  }

  return {
    supabase,
    user: authData.user,
    profile: profile as CustomerProfile,
  };
});
