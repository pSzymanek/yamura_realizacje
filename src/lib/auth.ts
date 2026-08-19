import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffProfile } from "@/lib/types";

export const requireStaff = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  return {
    supabase,
    user: authData.user,
    profile: profile as StaffProfile,
  };
});
