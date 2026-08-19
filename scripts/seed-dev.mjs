import { createClient } from "@supabase/supabase-js";

if (process.env.ALLOW_DEMO_SEED !== "true") {
  console.error("Seed przerwany. Ustaw ALLOW_DEMO_SEED=true wyłącznie w środowisku developerskim.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Brakuje NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w .env.local.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: project, error: projectError } = await supabase
  .from("projects")
  .upsert(
    {
      order_number: "YAM-TEST-001",
      title: "Kuchnia + zabudowa",
      customer_name: "Jan Testowy",
      customer_email: "jan.testowy@example.com",
      status: "production",
      next_step: "Kontrola dopasowania frontów",
      next_step_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
    { onConflict: "order_number" },
  )
  .select("id, access_token")
  .single();

if (projectError || !project) {
  console.error("Nie udało się utworzyć realizacji demonstracyjnej:", projectError?.message);
  process.exit(1);
}

const now = Date.now();
const { error: updatesError } = await supabase.from("project_updates").upsert([
  {
    id: "00000000-0000-4000-8000-000000000101",
    project_id: project.id,
    title: "Zamówienie przyjęte",
    description: "Potwierdziliśmy zakres realizacji i rozpoczęliśmy przygotowania.",
    status: "accepted",
    created_at: new Date(now - 21 * 86400000).toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    project_id: project.id,
    title: "Pomiar zakończony",
    description: "Wymiary zostały zweryfikowane na miejscu. Dokumentacja trafiła do pracowni.",
    status: "measurement",
    created_at: new Date(now - 14 * 86400000).toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    project_id: project.id,
    title: "Rozpoczęliśmy produkcję",
    description: "Materiały są skompletowane. Elementy zabudowy są obecnie wykonywane w naszej pracowni.",
    status: "production",
    created_at: new Date(now - 2 * 86400000).toISOString(),
  },
], { onConflict: "id" });

if (updatesError) {
  console.error("Nie udało się utworzyć wpisów demonstracyjnych:", updatesError.message);
  process.exit(1);
}

console.log("Utworzono dane demonstracyjne.");
console.log(`Link klienta: ${(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")}/r/${project.access_token}`);
